import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  Box,
  Card,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AdvancedDataTable from "../../../common/AdvancedDataTable";
import ColumnPercentageDataComponent from "../../../common/columnPercentageDataComponent";
import { useSearchParams } from "react-router";
import overviewContext from "../../../../../store/overview/overviewContext";
import { cachedFetch } from "../../../../../services/cachedFetch";

const HEADERS = [
  { key: "tag", label: "Tag" },
  { key: "marketShare", label: "MarketShare" },
  { key: "spends", label: "Spends" },
  { key: "spendShare", label: "Spend % Share" },
  { key: "sales", label: "Sales" },
  { key: "saleShare", label: "Sale % Share" },
  { key: "clicks", label: "Clicks" },
  { key: "orders", label: "Orders" },
  { key: "revenue", label: "ROAS" },
  { key: "impressions", label: "Total Impressions" },
  { key: "impressionsShare", label: "Impr % Share" },
];

const AggregatedView = () => {
  const [regionFilter, setRegionFilter] = useState("Business");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tableData, setTableData] = useState([]);
  const [searchParams] = useSearchParams();
  const operator = searchParams.get("operator");
  const { dateRange, formatDate } = useContext(overviewContext);

  // Map API data to table format
  const mappedData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];

    // Calculate totals for percentage shares
    const totalSpends = tableData.reduce((sum, item) => sum + (item.spends || 0), 0);
    const totalSales = tableData.reduce((sum, item) => sum + (item.sales || 0), 0);
    const totalImpressions = tableData.reduce((sum, item) => sum + (item.impressions || 0), 0);

    return tableData.map((item) => {
      // Calculate percentage shares
      const spendSharePercent = totalSpends > 0 ? ((item.spends || 0) / totalSpends * 100).toFixed(2) : 0;
      const saleSharePercent = totalSales > 0 ? ((item.sales || 0) / totalSales * 100).toFixed(2) : 0;
      const impressionsSharePercent = totalImpressions > 0 ? ((item.impressions || 0) / totalImpressions * 100).toFixed(2) : 0;

      return {
        tag: item.tag || "",
        marketShare: 0, // Not provided in API
        spends: item.spends || 0,
        spendsChange: item.spends_pct_change || 0,
        spendShare: spendSharePercent,
        spendShareChange: 0, // Not provided in API
        sales: item.sales || 0,
        salesChange: item.sales_pct_change || 0,
        saleShare: saleSharePercent,
        saleShareChange: 0, // Not provided in API
        clicks: item.clicks || 0,
        clicksChange: item.clicks_pct_change || 0,
        orders: item.orders || 0,
        ordersChange: item.orders_pct_change || 0,
        revenue: item.roas || 0,
        revenueChange: 0, // Not provided in API
        impressions: item.impressions || 0,
        impressionsChange: item.impressions_pct_change || 0,
        impressionsShare: impressionsSharePercent,
        impressionsShareChange: 0, // Not provided in API
        avgCpc: item.avg_cpc || 0,
        ctrPercent: item.ctr_percent || 0,
      };
    });
  }, [tableData]);



  const fetchAggregated = async () => {
    if (!operator || !dateRange) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        setTableData([]);
        return;
      }

      const startDate = formatDate(dateRange[0].startDate);
      const endDate = formatDate(dateRange[0].endDate);
      const param =
        regionFilter === "Business"
          ? "business"
          : regionFilter === "Targeting"
            ? "targeting"
            : regionFilter === "Ad Type"
              ? "ad_type"
              : regionFilter.toLowerCase();

      const url = `https://react-api-script.onrender.com/pidilite/aggregated-view?platform=${operator}&start_date=${startDate}&end_date=${endDate}&parameter_filter=${param}`;
      const cacheKey = `cache:GET:${url}`;
      const response = await cachedFetch(
        url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        { ttlMs: 5 * 60 * 1000, cacheKey }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("Aggregated API error:", errText || response.statusText);
        setTableData([]);
        return;
      }

      const json = await response.json();

      // Extract aggregated_data from API response (nested inside data object)
      const rows = Array.isArray(json?.data?.aggregated_data)
        ? json.data.aggregated_data
        : Array.isArray(json.aggregated_data)
          ? json.aggregated_data
          : [];

      setTableData(rows);
    } catch (error) {
      console.error("Failed to fetch aggregated data:", error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregated();
  }, [operator, regionFilter, dateRange]);

  const filteredData = useMemo(() => {
    let filtered = [...mappedData];

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        } else {
          return sortConfig.direction === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        }
      });
    }
    return filtered;
  }, [mappedData, sortConfig]);

  const columns = useMemo(
    () =>
      HEADERS.map((h) => ({
        field: h.key,
        headerName: h.label.toUpperCase(),
        flex: 1,
        minWidth: 120,
        sortable: true,
        renderCell: (params) => {
          const key = h.key;
          const row = params.row;
          if (
            [
              "spends",
              "spendShare",
              "sales",
              "saleShare",
              "clicks",
              "orders",
              "revenue",
              "impressions",
              "impressionsShare",
            ].includes(key)
          ) {
            return (
              <ColumnPercentageDataComponent
                mainValue={row[key]}
                percentValue={row[`${key}Change`] || 0}
              />
            );
          }
          if (key === "marketShare") return `${row[key]}%`;
          return row[key];
        },
      })),
    []
  );

  const handleExport = () => {
    const headers = HEADERS.map((h) => h.label.toUpperCase());
    const rowsData = filteredData.map((row) => HEADERS.map((h) => row[h.key]));
    const csvContent = [headers, ...rowsData]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "aggregated_data.csv");
    link.click();
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box component="h5">Aggregated View</Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            select
            size="small"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Targeting">Targeting</MenuItem>
            <MenuItem value="Ad Type">Ad Type</MenuItem>
          </TextField>
          <Button
            onClick={handleExport}
            style={{
              backgroundColor: "black",
              borderColor: "black",
            }}
            variant="contained"
          >
            Export
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            width: "100%",
            minHeight: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={48} />
        </Box>
      ) : (
        <AdvancedDataTable
          columns={columns}
          rows={filteredData}
          loading={loading}
          hideFooter={true}
          showExportButton={false}
          dynamicHeight={filteredData.length > 4 ? 300 : "auto"}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AggregatedView;
