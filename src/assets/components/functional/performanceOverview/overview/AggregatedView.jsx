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
  Popover,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  LayoutGrid,
  Sparkles,
  Layers
} from "lucide-react";
import { useSearchParams } from "react-router";
import overviewContext from "../../../../../store/overview/overviewContext";
import { cachedFetch } from "../../../../../services/cachedFetch";
import ComparisonMenu from "./ComparisonMenu";
import {
  startOfMonth,
  startOfYear,
  subWeeks,
  subMonths,
  subYears,
  format as format_date,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subDays
} from "date-fns";

const HEADERS = [
  { key: "tag", label: "Campaign Type" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Clicks" },
  { key: "avg_cpc", label: "CPC" },
  { key: "orders", label: "Orders" },
  { key: "ctr_percent", label: "CTR" },
  { key: "sales", label: "Sales" },
];

const AggregatedView = () => {
  const [regionFilter, setRegionFilter] = useState("Business");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tableData, setTableData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [untagged, setUntagged] = useState(null);
  const [searchParams] = useSearchParams();
  const operator = searchParams.get("operator");
  const { dateRange, formatDate } = useContext(overviewContext);

  // Comparison State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleComparisonOpen = (event) => setAnchorEl(event.currentTarget);
  const handleComparisonClose = () => setAnchorEl(null);
  const handleApplyComparison = (periods) => {
    setSelectedPeriods(periods);
    handleComparisonClose();
  };

  const toggleRow = (tag) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(tag)) newExpanded.delete(tag);
    else newExpanded.add(tag);
    setExpandedRows(newExpanded);
  };

  const calculateComparisonDates = (type) => {
    const today = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (type) {
      case "last_week":
        currentStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        currentEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        previousStart = startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });
        previousEnd = endOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });
        break;
      case "last_month":
        currentStart = startOfMonth(subMonths(today, 1));
        currentEnd = endOfMonth(subMonths(today, 1));
        previousStart = startOfMonth(subMonths(today, 2));
        previousEnd = endOfMonth(subMonths(today, 2));
        break;
      case "mtd":
        currentStart = startOfMonth(today);
        currentEnd = today;
        previousStart = startOfMonth(subMonths(today, 1));
        previousEnd = endOfMonth(subMonths(today, 1));
        break;
      case "last_3_months":
        currentStart = startOfMonth(subMonths(today, 3));
        currentEnd = endOfMonth(subMonths(today, 1));
        previousStart = startOfMonth(subMonths(today, 6));
        previousEnd = endOfMonth(subMonths(today, 4));
        break;
      case "ytd":
        currentStart = startOfYear(today);
        currentEnd = today;
        previousStart = startOfYear(subYears(today, 1));
        previousEnd = subYears(today, 1);
        break;
      default:
        return null;
    }

    return {
      start_date: format_date(currentStart, "yyyy-MM-dd"),
      end_date: format_date(currentEnd, "yyyy-MM-dd"),
      compare_start_date: format_date(previousStart, "yyyy-MM-dd"),
      compare_end_date: format_date(previousEnd, "yyyy-MM-dd"),
    };
  };

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

      let startDate = formatDate(dateRange[0].startDate);
      let endDate = formatDate(dateRange[0].endDate);
      let compareParams = "";

      if (selectedPeriods.length > 0) {
        const period = selectedPeriods[0];
        if (period.startsWith("custom:")) {
          const dates = period.replace("custom:", "").split("_");
          startDate = dates[0];
          endDate = dates[1];
          compareParams = `&compare_periods=custom`;
        } else {
          const calculated = calculateComparisonDates(period);
          if (calculated) {
            startDate = calculated.start_date;
            endDate = calculated.end_date;
            compareParams = `&compare_periods=${period}&prev_start_date=${calculated.compare_start_date}&prev_end_date=${calculated.compare_end_date}`;
          }
        }
      }

      const param =
        regionFilter === "Business"
          ? "business"
          : regionFilter === "Targeting"
            ? "targeting"
            : regionFilter === "Ad Type"
              ? "ad_type"
              : regionFilter.toLowerCase();

      let url = `https://react-api-script.onrender.com/boat/aggregated-view?platform=${operator}&start_date=${startDate}&end_date=${endDate}&parameter_filter=${param}${compareParams}`;

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
      const data = json.data || json;
      setTableData(data.aggregated_data || []);
      setTotals(data.totals);
      setUntagged(data.untagged);
    } catch (error) {
      console.error("Failed to fetch aggregated data:", error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregated();
  }, [operator, regionFilter, dateRange, selectedPeriods, formatDate]);

  const formatValue = (key, val) => {
    if (val === undefined || val === null) return "-";
    if (key === "ctr_percent") return `${Number(val).toFixed(2)}%`;
    if (key === "sales" || key === "avg_cpc") return `₹${formatLargeNumber(val)}`;
    return formatLargeNumber(val);
  };

  const formatLargeNumber = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
    return Number(num).toLocaleString("en-IN");
  };

  const getDiffColor = (val) => (val >= 0 ? "#10B981" : "#EF4444");

  return (
    <Card sx={{ p: 0, borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "visible" }}>
      {/* HEADER */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: "#F3E8FF", borderRadius: "8px", display: "flex" }}>
            <Layers size={20} color="#7C3AED" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Performance Breakdown</Typography>
            <Typography variant="caption" color="textSecondary">Analyze by dimensions</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Compare Periods Button */}
          <Button
            variant="outlined"
            onClick={handleComparisonOpen}
            startIcon={<Calendar size={16} />}
            endIcon={<ChevronDown size={14} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              borderColor: "#E2E8F0",
              color: "#64748B",
              fontWeight: 600,
              bgcolor: "transparent",
              "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" }
            }}
          >
            Compare Periods ({selectedPeriods.length})
          </Button>

          {/* Untagged Label */}
          {untagged && (
            <Box sx={{ bgcolor: "#FFFBEB", px: 1.5, py: 0.5, borderRadius: "8px", border: "1px solid #FEF3C7" }}>
              <Typography variant="caption" sx={{ color: "#D97706", fontWeight: 600 }}>
                {untagged.percentage}% untagged
              </Typography>
            </Box>
          )}

          {/* Dimension Select */}
          <TextField
            select
            size="small"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            InputProps={{
              startAdornment: <LayoutGrid size={16} style={{ marginRight: 8, color: "#94A3B8" }} />,
              sx: { borderRadius: "10px", bgcolor: "#F8FAFC", border: "none", "& fieldset": { border: "none" } }
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Targeting">Targeting</MenuItem>
            <MenuItem value="Ad Type">Ad Type</MenuItem>
          </TextField>

          <IconButton size="small" sx={{ border: "1px solid #E2E8F0", borderRadius: "8px" }}>
            <Download size={18} color="#64748B" />
          </IconButton>
        </Box>
      </Box>

      {/* TABLE */}
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <th style={{ padding: "12px 24px", fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Dimension</th>
              {HEADERS.slice(1).map(h => (
                <th key={h.key} style={{ padding: "12px", fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={HEADERS.length} style={{ padding: "40px", textAlign: "center" }}><CircularProgress size={32} /></td></tr>
            ) : (
              <>
                {/* TOTAL ROW */}
                {totals && (
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "16px 24px", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles size={16} color="#7C3AED" /> Total
                    </td>
                    {HEADERS.slice(1).map(h => (
                      <td key={h.key} style={{ padding: "16px 12px", textAlign: "right", fontWeight: 700 }}>
                        {formatValue(h.key, totals[h.key])}
                      </td>
                    ))}
                  </tr>
                )}

                {/* DATA ROWS */}
                {tableData.length === 0 ? (
                  <tr><td colSpan={HEADERS.length} style={{ padding: "40px", textAlign: "center" }}><Typography variant="body2" color="textSecondary">No data found</Typography></td></tr>
                ) : (
                  tableData.map((row) => (
                    <React.Fragment key={row.tag}>
                      <tr
                        onClick={() => toggleRow(row.tag)}
                        style={{ cursor: "pointer", borderBottom: "1px solid #F1F5F9", transition: "all 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                          {selectedPeriods.length > 0 ? (expandedRows.has(row.tag) ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981" }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.tag}</Typography>
                        </td>
                        {HEADERS.slice(1).map(h => (
                          <td key={h.key} style={{ padding: "14px 12px", textAlign: "right" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatValue(h.key, row[h.key])}</Typography>
                          </td>
                        ))}
                      </tr>

                      {/* EXPANDED COMPARISON ROWS */}
                      {expandedRows.has(row.tag) && row.comparison_data && Object.entries(row.comparison_data).map(([pKey, pData]) => (
                        <tr key={pKey} style={{ backgroundColor: "#FDFCFE" }}>
                          <td style={{ padding: "10px 24px 10px 48px" }}>
                            <Typography variant="caption" sx={{ color: "#7C3AED", fontWeight: 600 }}>{pKey.replace("_", " ").toUpperCase()}</Typography>
                          </td>
                          {HEADERS.slice(1).map(h => (
                            <td key={h.key} style={{ padding: "10px 12px", textAlign: "right" }}>
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{formatValue(h.key, pData[h.key])}</Typography>
                                <Typography variant="caption" sx={{ color: getDiffColor(pData[`${h.key}_diff`]), fontWeight: 700, fontSize: "10px" }}>
                                  {pData[`${h.key}_diff`] >= 0 ? "↑" : "↓"} {Math.abs(pData[`${h.key}_diff`])}%
                                </Typography>
                              </Box>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </>
            )}
          </tbody>
        </table>
      </Box>

      {/* POPOVERS & SNACKBARS */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleComparisonClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { borderRadius: "16px", mt: 1, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" } }}
      >
        <ComparisonMenu
          selectedPeriods={selectedPeriods}
          onApply={handleApplyComparison}
          onClose={handleComparisonClose}
        />
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AggregatedView;
