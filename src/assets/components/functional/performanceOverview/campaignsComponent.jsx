import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import '../../../styles/campaignsComponent/campaignsComponent.less';
import overviewContext from "../../../../store/overview/overviewContext";
import { Switch, Box, Button, Snackbar, Alert } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from "@mui/material";
import { useSearchParams } from "react-router";
import ColumnPercentageDataComponent from "../../common/columnPercentageDataComponent";
import TrendsModal from "./modal/trendsModal";
import BudgetCell from "./overview/budgetCell";
import NewPercentageDataComponent from "../../common/newPercentageDataComponent";

const CampaignsComponent = () => {

    const dataContext = useContext(overviewContext)
    const { dateRange, brands, getBrandsData, formatDate } = dataContext

    const [updatingCampaigns, setUpdatingCampaigns] = useState({});
    const [showTrendsModal, setShowTrendsModal] = useState({ name: '', show: false, date: [] })
    const [campaignsData, setCampaignsData] = useState({})
    // const { dateRange, brands, getBrandsData, formatDate } = dataContext
    const [isLoading, setIsLoading] = useState(false)
     const [paginationModel, setPaginationModel] = useState({
            page: 0,
            pageSize: 100,
        });
    const [confirmation, setConfirmation] = useState({ show: false, campaignId: null, campaignType: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [totalCount, setTotalCount] = useState(0);

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

    const STATUS_OPTIONS = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Paused' }
    ]





  const CampaignsColumnAmazon = [
  {
    field: "campaign_name",
    headerName: "CAMPAIGN",
    minWidth: 220,
    renderCell: (params) => (
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 0.5, cursor: "pointer" }}
        onClick={() =>
          handleCampaignClick(params.row.campaign_name, params.row.campaign_id)
        }
        className="redirect"
      >
        {params.row.campaign_name}
      </Box>
    ),
  },

  {
    field: "budget",
    headerName: "BUDGET",
    minWidth: 180,
    renderCell: (params) => (
      <BudgetCell
        value={params.row.budget}
        campaignId={params.row.campaign_id}
        platform={operator}
        campaignName={params.row.campaign_name}
        campaignType={params.row.campaign_type}
        onUpdate={(
          campaignId,
          campaignName,
          campaignType,
          newBudget
        ) => {
          setCampaignsData((prev) => ({
            ...prev,
            data: prev.data.map((c) =>
              c.campaign_id === campaignId &&
              c.campaign_name === campaignName &&
              c.campaign_type === campaignType
                ? { ...c, budget: newBudget }
                : c
            ),
          }));
        }}
        onSnackbarOpen={handleSnackbarOpen}
      />
    ),
    type: "number",
    align: "left",
    headerAlign: "left",
  },

  {
    field: "status",
    headerName: "STATUS",
    minWidth: 100,
    renderCell: (params) => {
      if (updatingCampaigns[params.row.campaign_id]) {
        return (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        );
      }
      return (
        <Switch
          disabled={params.row.status === 2}
          checked={params.row.status === 1}
          onChange={() =>
            handleToggle(params.row.campaign_id, params.row.campaign_type)
          }
        />
      );
    },
  },

  {
    field: "campaign_type",
    headerName: "AD TYPE",
    minWidth: 140,
  },

  {
    field: "spend",
    headerName: "SPENDS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.spend}
        percentValue={params.row.spend_abs_diff}
      />
    ),
  },

  {
    field: "sales",
    headerName: "SALES",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.sales}
        percentValue={params.row.sales_abs_diff}
      />
    ),
  },

  {
    field: "impressions",
    headerName: "IMPRESSIONS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.impressions}
        percentValue={params.row.impressions_abs_diff}
      />
    ),
  },

  {
    field: "clicks",
    headerName: "CLICKS",
    minWidth: 140,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.clicks}
        percentValue={params.row.clicks_abs_diff}
      />
    ),
  },

  {
    field: "orders",
    headerName: "ORDERS",
    minWidth: 140,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.orders}
        percentValue={params.row.orders_abs_diff}
      />
    ),
  },

  {
    field: "ctr",
    headerName: "CTR",
    minWidth: 120,
  
  },

  {
    field: "cpc",
    headerName: "CPC",
    minWidth: 120,
  
  },

  {
    field: "cvr",
    headerName: "CVR",
    minWidth: 120,
   
  },

  {
    field: "roas",
    headerName: "ROAS",
    minWidth: 120,
  
  },

  {
    field: "acos",
    headerName: "ACOS",
    minWidth: 120,
   
  },

  {
    field: "aov",
    headerName: "AOV",
    minWidth: 140,
   
  },
];


      const CampaignsColumnBigBasket = [
        {
            field: "Campaign Name",
            headerName: "CAMPAIGN",
            minWidth: 200,
            /*{renderCell: (params) => (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        cursor: "pointer"
                    }}
                    onClick={() => handleCampaignClick(params.row.Campaign_Name, params.row.campaign_id)}
                    className="redirect"
                >
                    {params.row.Campaign_Name}
                </Box>
            ),*/
        
    },
       
        {
            field: "Spend",
            headerName: "SPENDS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Spend} percentValue={params.row.Spend_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
       
        {
            field: "Sales",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Sales} percentValue={params.row.Sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

       
       
        {
            field: "Impressions",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Impressions} percentValue={params.row.Impressions} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
       
        {
            field: "Clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Clicks} percentValue={params.row.Clicks_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        
         {
            field: "CTR",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.CTR} secValue={params.row.CTR_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "CPC",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.CPC} percentValue={params.row.CPC_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "Cpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.Cpm} secValue={params.row.Cpm_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "ROI",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ROI} percentValue={params.row.ROI_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        
        {
            field: "ACOS",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.ACOS} secValue={params.row.ACOS_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

    ];


    const CampaignsColumnSwiggy = [
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 200,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        cursor: "pointer"
                    }}
                    onClick={() => handleCampaignClick(params.row.campaign_name, params.row.campaign_id)}
                    className="redirect"
                >
                    {params.row.campaign_name}
                </Box>
            ),
        },
        {
            field: "budget",
            headerName: "BUDGET",
            minWidth: 200,
            renderCell: (params) => <BudgetCell value={params.row.budget} campaignId={params.row.campaign_id} endDate={params.row.end_date || null} platform={operator}
                onUpdate={(campaignId, newBudget) => {
                    console.log("Updating campaign:", campaignId, "New budget:", newBudget);
                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.campaign_id === campaignId
                                    ? { ...campaign, daily_budget: newBudget }
                                    : campaign
                            )
                        };
                        console.log("Updated campaignsData:", updatedData);
                        return updatedData;
                    });
                }} onSnackbarOpen={handleSnackbarOpen} />, type: "number", align: "left",
            headerAlign: "left",
        },
        /*{
            field: "status",
            headerName: "STATUS",
            minWidth: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                if (updatingCampaigns[params.row.campaign_id]) {
                    return <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress size={24} /></Box>;
                }
                return (
                    <Switch
                        checked={params.row.status === 1}
                        onChange={() => handleToggle(params.row.campaign_id, params.row.status === 1 ? 1 : 0, params.row.brand_id)}
                    />
                )
            },
            type: "singleSelect",
            valueOptions: STATUS_OPTIONS
        },*/
        
        //{ field: "brand_name", headerName: "BRAND", minWidth: 150, type: "singleSelect", valueOptions: brands?.brands },
        {
            field: "spend",
            headerName: "SPENDS",
            minWidth: 170,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.spend} percentValue={params.row.spend_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "sales",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.sales} percentValue={params.row.sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "impressions",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions} percentValue={params.row.impressions_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "a2c",
            headerName: "ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.a2c} percentValue={params.row.a2c_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "a2c_rate",
            headerName: "ATC RATE",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.a2c_rate} percentValue={params.row.a2c_rate_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "atc",
            headerName: " ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.atc} percentValue={params.row.atc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        

        {
            field: "ctr",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.ctr} secValue={params.row.ctr_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "ecpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ecpm} percentValue={params.row._change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "roi",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roi} percentValue={params.row.roi_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

    ];

    const CampaignsColumnZepto = [
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ cursor: "pointer" }}>
                        {params.row.campaign_name}
                    </Box>
                </Box>
            ),
        },
        {
            field: "smart_daily_budget",
            headerName: "BUDGET",
            minWidth: 200,
            renderCell: (params) => <BudgetCell value={params.row.smart_daily_budget} campaignId={params.row.campaign_id} endDate={params.row.end_date || null} platform={operator}
                onUpdate={(campaignId, newBudget) => {
                    console.log("Updating campaign:", campaignId, "New budget:", newBudget);
                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.campaign_id === campaignId
                                    ? { ...campaign, daily_budget: newBudget }
                                    : campaign
                            )
                        };
                        console.log("Updated campaignsData:", updatedData);
                        return updatedData;
                    });
                }} onSnackbarOpen={handleSnackbarOpen} />, type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "status",
            headerName: "STATUS",
            minWidth: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                if (updatingCampaigns[params.row.campaign_id]) {
                    return <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress size={24} /></Box>;
                }
                return (
                    <Switch
                        checked={params.row.status === 1}
                        onChange={() => handleToggle(params.row.campaign_id, params.row.status === 1 ? 1 : 0, params.row.brand_id)}
                    />
                )
            },
            type: "singleSelect",
            valueOptions: STATUS_OPTIONS
        },
        { field: "ad_type", headerName: "AD TYPE", minWidth: 150 },
        { field: "brand_name", headerName: "BRAND", minWidth: 150, type: "singleSelect", valueOptions: brands?.brands },
        {
            field: "spend",
            headerName: "SPENDS",
            minWidth: 170,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.spend} percentValue={params.row.spend_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "sales",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.sales} percentValue={params.row.sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "impressions",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions} percentValue={params.row.impressions_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "cvr",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.cvr} secValue={params.row.cvr_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "atc",
            headerName: " ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.atc} percentValue={params.row.atc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "aov",
            headerName: "AOV",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.aov} percentValue={params.row.aov_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "orders",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.orders} percentValue={params.row.orders_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "cpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpm} percentValue={params.row.cpm_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "roas",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas} percentValue={params.row.roas_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

    ];



    const getCampaignsData = async () => {
        if (!operator) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setCampaignsData({});
        setIsLoading(true);

        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found");
            setIsLoading(false);
            return;
        }

        const startDate = formatDate(dateRange[0].startDate);
        const endDate = formatDate(dateRange[0].endDate);

        try {
            const response = await fetch(`https://react-api-script.onrender.com/boat/campaign?start_date=${startDate}&end_date=${endDate}&platform=${operator}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setCampaignsData(data);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Previous request aborted due to operator change.");
            } else {
                console.error("Failed to fetch keywords data:", error.message);
                setCampaignsData({});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const abortControllerRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            getCampaignsData();
        }, 100);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearTimeout(timeout);
        }
    }, [operator, dateRange]);

    useEffect(() => {
        getBrandsData()
    }, [operator])

    const columns = useMemo(() => {
        if (operator === "Amazon") return CampaignsColumnAmazon;

        if (operator === "Zepto") return CampaignsColumnZepto;
        if (operator === "BigBasket") return CampaignsColumnBigBasket;
        if (operator === "Swiggy") return CampaignsColumnSwiggy;
        return [];
    }, [operator, brands, updatingCampaigns]);

    const handleCampaignClick = async (campaignName, campaignId) => {
        try {
            const token = localStorage.getItem("accessToken");
            const startDate = formatDate(dateRange[0].startDate);
            const endDate = formatDate(dateRange[0].endDate);
            const response = await fetch(`https://react-api-script.onrender.com/boat/campaign_graph?end_date=${formatDate(endDate)}&platform=${operator}&campaign_id=${campaignId}&start_date=${formatDate(startDate)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json()
            if (response.ok) {
                setShowTrendsModal({ name: campaignName, show: true, data: data });
            } else {
                console.error("Failed to fetch campaign data");
            }
        } catch (error) {
            console.error("Error fetching campaign data", error);
        }
    };

    const handleToggle = (campaignId, campaignType) => {
        setConfirmation({ show: true, campaignId, campaignType });
    };

    const updateCampaignStatus = (campaignId, campaignType) => {
        setCampaignsData(prevData => ({
            ...prevData,
            data: prevData.data.map(campaign =>
                campaign.campaign_id === campaignId && campaign.campaign_type === campaignType ? { ...campaign, status: campaign.status === 1 ? 0 : 1 } : campaign
            )
        }));
    };

    const confirmStatusChange = async () => {
        setConfirmation({ show: false, campaignId: null, campaignType: null });
        const { campaignId, campaignType } = confirmation;
        if (!campaignId) return;
        setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: true, [campaignType]: true }));

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("No access token found");
            const params = new URLSearchParams({
                platform: operator,
                campaign_id: campaignId,
                campaign_type: campaignType,
            });
            const response = await fetch(`https://react-api-script.onrender.com/boat/update_campaign_status?${params.toString()}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) throw new Error("Failed to update campaign status");
            updateCampaignStatus(campaignId, campaignType);
            handleSnackbarOpen("Status updated successfully!", "success");
        } catch (error) {
            console.error("Error updating campaign status:", error);
            handleSnackbarOpen("Failed to update status!", "error");
        } finally {
            setUpdatingCampaigns(prev => {
                const newState = { ...prev };
                delete newState[campaignId];
                delete newState[campaignType];
                return newState;
            });
        }
    };

    const handleSnackbarOpen = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <React.Fragment>
            <Dialog open={confirmation.show} onClose={() => setConfirmation({ show: false, campaignId: null, campaignType: null })}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>Are you sure you want to change status of this campaign?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmation({ show: false, campaignId: null, campaignType: null })}>Cancel</Button>
                    <Button onClick={confirmStatusChange} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>
            <TrendsModal
                showTrendsModal={showTrendsModal}
                setShowTrendsModal={setShowTrendsModal} />
            <div className="shadow-box-con-campaigns aggregated-view-con">
                <div className="datatable-con-campaigns">
                    <MuiDataTableComponent
                        isLoading={isLoading}
                        isExport={true}
                        columns={columns}
                        data={campaignsData?.data} />
                </div>
            </div>
            <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}

export default CampaignsComponent;