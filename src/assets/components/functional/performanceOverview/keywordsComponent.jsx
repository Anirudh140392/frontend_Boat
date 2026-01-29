import React, { useEffect, useContext, useState, useMemo, useRef } from "react";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import '../../../styles/keywordsComponent/keywordsComponent.less';
import { Typography, Snackbar, Alert, Button, Switch,Box } from "@mui/material";
import overviewContext from "../../../../store/overview/overviewContext";
import { useSearchParams, useNavigate } from "react-router";
import ColumnPercentageDataComponent from "../../common/columnPercentageDataComponent";
import TrendsModal from "./modal/trendsModal";
import BidCell from "./overview/bidCell";
import { Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from "@mui/material";

const KeywordsComponent = () => {

    const { dateRange, getBrandsData, brands, formatDate, campaignName } = useContext(overviewContext)

    const [showTrendsModal, setShowTrendsModal] = useState({ name: '', show: false, date: [] })
    const [updatingKeywords, setUpdatingKeywords] = useState({});
    const [keywordsData, setKeywordsData] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [confirmation, setConfirmation] = useState({ show: false, campaignType: null, keywordId: null, targetId: null, adGroupId: null, campaignId: null });

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");
    const navigate = useNavigate()

    const getKeywordsData = async () => {
        if (!operator) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setKeywordsData({});
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
            const response = await fetch(`https://react-api-script.onrender.com/boat/keyword?start_date=${startDate}&end_date=${endDate}&platform=${operator}`, {
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
            setKeywordsData(data);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Previous request aborted due to operator change.");
            } else {
                console.error("Failed to fetch keywords data:", error.message);
                setKeywordsData({});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const abortControllerRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            getKeywordsData();
        }, 100);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearTimeout(timeout);
        }
    }, [operator, dateRange, campaignName]);

    useEffect(() => {
        getBrandsData()
    }, [operator])

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
            window.location.reload();
        }
    }, []);

    const handleToggle = (campaignType, keywordId, targetId, adGroupId, campaignId) => {
        setConfirmation({ show: true, campaignType, keywordId, targetId, adGroupId, campaignId });
    };

  const KeywordsColumnAmazon = [
  {
    field: "Keyword_Text",
    headerName: "TARGET",
    minWidth: 150,
    renderCell: (params) => (
     
        <Typography className="redirect" variant="body2">
          {params.row.Keyword_Text}
        </Typography>
     
    ),
  },

  {
    field: "Bid",
    headerName: "BID",
    minWidth: 150,
    type: "number",
    renderCell: (params) => (
      <BidCell
        value={params.row.Bid}
        campaignId={params.row.Campaign_ID}
        targetId={params.row.Keyword_ID}
        campaignType={params.row.Product}
        adGroupId={params.row.Ad_Group_ID}
        keywordId={params.row.Keyword_ID}
        platform={operator}
        onUpdate={(
          campaignId,
          targetId,
          campaignType,
          adGroupId,
          keywordId,
          newBid
        ) => {
          setKeywordsData(prev => ({
            ...prev,
            data: prev.data.map(row =>
              row.Campaign_ID === campaignId &&
              row.Keyword_ID === keywordId &&
              row.Ad_Group_ID === adGroupId
                ? { ...row, Bid: newBid }
                : row
            ),
          }));
        }}
        onSnackbarOpen={handleSnackbarOpen}
      />
    ),
  },

  {
    field: "State",
    headerName: "STATUS",
    minWidth: 100,
    renderCell: (params) => (
      <Switch
        checked={params.row.State === "enabled"}
        onChange={() =>
          handleToggle(
            params.row.Product,
            params.row.Keyword_ID,
            params.row.Keyword_ID,
            params.row.Ad_Group_ID,
            params.row.Campaign_ID
          )
        }
      />
    ),
  },

  {
    field: "Spend",
    headerName: "SPENDS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.Spend}
        percentValue={params.row.Spend_diff}
      />
    ),
  },

  {
    field: "Sales",
    headerName: "SALES",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.Sales}
        percentValue={params.row.Sales_diff}
      />
    ),
  },

  {
    field: "Impressions",
    headerName: "IMPRESSIONS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.Impressions}
        percentValue={params.row.Impressions_diff}
      />
    ),
  },

  {
    field: "Clicks",
    headerName: "CLICKS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.Clicks}
        percentValue={params.row.Clicks_diff}
      />
    ),
  },

  {
    field: "Orders",
    headerName: "ORDERS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.Orders}
        percentValue={params.row.Orders_diff}
      />
    ),
  },

  {
    field: "ctr",
    headerName: "CTR",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.ctr}
        percentValue={params.row.ctr_diff}
      />
    ),
  },

  {
    field: "cpc",
    headerName: "CPC",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.cpc}
        percentValue={params.row.cpc_diff}
      />
    ),
  },

  {
    field: "cvr",
    headerName: "CVR",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.cvr}
        percentValue={params.row.cvr_diff}
      />
    ),
  },

  {
    field: "roas",
    headerName: "ROAS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.roas}
        percentValue={params.row.roas_diff}
      />
    ),
  },

  {
    field: "acos",
    headerName: "ACOS",
    minWidth: 150,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.acos}
        percentValue={params.row.acos_diff}
      />
    ),
  },

  {
    field: "Campaign_Name_Informational_only",
    headerName: "CAMPAIGN",
    minWidth: 300,
  },

  {
    field: "Ad_Group_Name_Informational_only",
    headerName: "AD GROUP",
    minWidth: 150,
  },
];


    const KeywordsColumnZepto = [
        {
            field: "keyword_name",
            headerName: "TARGET",
            minWidth: 150,
            renderCell: (params) => (
                <div className="text-icon-div cursor-pointer">
                    <Typography variant="body2">{params.row.keyword_name}</Typography>
                </div>
            ),
        },
         { field: "match_type", headerName: "MATCH TYPE", minWidth: 150, headerAlign: "left", },
        {
            field: "cpc",
            headerName: "BID",
            minWidth: 150,
            renderCell: (params) => (
                <BidCell
                    value={params.row.cpc}
                    campaignId={params.row.campaign_id}
                    platform={operator}
                    keyword={params.row.keyword_name}
                    matchType={params.row.match_type}
                    onUpdate={(campaignId, keyword, newBid, matchType) => {
                        console.log("Updating bid:", { campaignId, keyword, newBid, matchType });
                        setKeywordsData(prevData => {
                            const updatedData = {
                                ...prevData,
                                data: prevData.data.map(row =>
                                    row.campaign_id === campaignId &&
                                        row.keyword_name === keyword &&
                                        row.match_type === matchType
                                        ? { ...row, cpc: newBid }
                                        : row
                                )
                            };
                            console.log("Updated keywordsData:", updatedData);
                            return updatedData;
                        });
                    }} onSnackbarOpen={handleSnackbarOpen}
                />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "status",
            headerName: "BID STATUS",
            minWidth: 100,
            renderCell: () => <Switch checked={1} />,
        },
        { field: "keyword_type", headerName: "KEYWORD TYPE", minWidth: 150, },
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
            field: "revenue",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.revenue} percentValue={params.row.revenue_change} />
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
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_change} />
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
            field: "ctr",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ctr} percentValue={params.row.ctr_change} />
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

        /*{
            field: "direct_sales",
            headerName: "DIRECT SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.direct_sales} percentValue={params.row.direct_sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "roas",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas} percentValue={params.row.roas_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "atc",
            headerName: "ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.atc} percentValue={params.row.atc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "cvr",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cvr} percentValue={params.row.cvr_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

       
        /*{
            field: "ad_type", headerName: "AD TYPE", minWidth: 150,
        },*/
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 300,
        },
    ];

      const KeywordsColumnBigBasket = [
        {
            field: "Keyword",
            headerName: "TARGET",
            minWidth: 150,
            renderCell: (params) => (
                <div className="text-icon-div cursor-pointer" onClick={() => handleKeywordClick(params.row.Keyword, params.row.Campaign_Id)}>
                    <Typography className="redirect" variant="body2">{params.row.Keyword}</Typography>
                </div>
            ),
        },
         { field: "Match Type", headerName: "MATCH TYPE", minWidth: 150, headerAlign: "left", },
        
       
       {
            field: "Spend",
            headerName: "SPENDS",
            minWidth: 170,
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
                <ColumnPercentageDataComponent mainValue={params.row.Impressions} percentValue={params.row.Impressions_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
       
       

        {
            field: "Cpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Cpm} percentValue={params.row.Cpm_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        
         {
            field: "ACOS",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ACOS} percentValue={params.row.ACOS_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "direct_sales",
            headerName: "DIRECT SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.direct_sales} percentValue={params.row.direct_sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

       
         {
            field: "ROAS",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ROAS} percentValue={params.row.ROAS_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        
        {
            field: "Campaign Name",
            headerName: "CAMPAIGN",
            minWidth: 300,
        },
    ];


    const KeywordsColumnSwiggy = [
        {
            field: "keyword",
            headerName: "TARGET",
            minWidth: 150,
            renderCell: (params) => (
                <div className="text-icon-div cursor-pointer">
                    <Typography variant="body2">{params.row.keyword}</Typography>
                </div>
            ),
        },
         { field: "match_type", headerName: "MATCH TYPE", minWidth: 150, headerAlign: "left", },
        {
            field: "ecpm",
            headerName: "BID",
            minWidth: 150,
            renderCell: (params) => (
                <BidCell
                    value={params.row.ecpm}
                    campaignId={params.row.campaign_id}
                    platform={operator}
                    keyword={params.row.keyword_name}
                    matchType={params.row.match_type}
                    onUpdate={(campaignId, keyword, newBid, matchType) => {
                        console.log("Updating bid:", { campaignId, keyword, newBid, matchType });
                        setKeywordsData(prevData => {
                            const updatedData = {
                                ...prevData,
                                data: prevData.data.map(row =>
                                    row.campaign_id === campaignId &&
                                        row.keyword_name === keyword &&
                                        row.match_type === matchType
                                        ? { ...row, cpc: newBid }
                                        : row
                                )
                            };
                            console.log("Updated keywordsData:", updatedData);
                            return updatedData;
                        });
                    }} onSnackbarOpen={handleSnackbarOpen}
                />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        
       
        /*{ field: "brand_name", headerName: "BRAND", minWidth: 150, type: "singleSelect", valueOptions: brands?.brands },*/
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
        /*{
            field: "ecpm",
            headerName: "CPM",
            minWidth: 170,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ecpm} percentValue={params.row.ecpm_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/



        {
            field: "ctr",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ctr} percentValue={params.row.ctr_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "direct_sales",
            headerName: "DIRECT SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.direct_sales} percentValue={params.row.direct_sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "roi",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roi} percentValue={params.row.roi_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "atc",
            headerName: "ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.atc} percentValue={params.row.atc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

       
        /*{
            field: "ad_type", headerName: "AD TYPE", minWidth: 150,
        },*/
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

       
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 300,
        },
    ];

    useEffect(() => {
        getBrandsData()
    }, [operator])

    const columns = useMemo(() => {
        if (operator === "Amazon") return KeywordsColumnAmazon;

        if (operator === "Zepto") return KeywordsColumnZepto;
         if (operator === "BigBasket") return KeywordsColumnBigBasket;
         if (operator === "Swiggy") return KeywordsColumnSwiggy;
        return [];
    }, [operator, brands, updatingKeywords]);

    const handleKeywordClick = async (keywordName, campaignId) => {
        try {
            const token = localStorage.getItem("accessToken");
            const startDate = formatDate(dateRange[0].startDate);
            const endDate = formatDate(dateRange[0].endDate);
            const params = new URLSearchParams({
                end_date: formatDate(endDate),
                platform: operator,
                campaign_id: campaignId,
                keyword: keywordName,
                start_date: formatDate(startDate),
            });
            const response = await fetch(`https://react-api-script.onrender.com/boat/keyword_graph?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json()
            if (response.ok) {
                setShowTrendsModal({ name: keywordName, show: true, data: data });
            } else {
                console.error("Failed to fetch campaign data");
            }
        } catch (error) {
            console.error("Error fetching campaign data", error);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSnackbarOpen = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const updateKeywordStatus = (campaignType, keywordId, targetId, adGroupId, campaignId) => {
        setKeywordsData(prevData => ({
            ...prevData,
            data: prevData.data.map(keyword =>
                keyword.campaign_id_x === campaignId && keyword.campaign_type_x === campaignType && keyword.keyword_id_x === keywordId && keyword.targeting_id_x === targetId && keyword.ad_group_id_x === adGroupId ? { ...keyword, status: keyword.status === 1 ? 0 : 1 } : keyword
            )
        }));
    };

    const confirmStatusChange = async () => {
        setConfirmation({ show: false, campaignType: null, keywordId: null, targetId: null, adGroupId: null, campaignId: null });
        const { campaignType, keywordId, targetId, adGroupId, campaignId } = confirmation;

        setUpdatingKeywords(prev => ({ ...prev, [campaignId]: true, [campaignType]: true, [keywordId]: true, [targetId]: true, [adGroupId]: true }));

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("No access token found");
            const params = new URLSearchParams({
                platform: operator,
                campaign_type: campaignType,
                keyword_id: keywordId,
                target_id: targetId,
                ad_group_id: adGroupId,
                campaign_id: campaignId
            });
            const response = await fetch(`https://react-api-script.onrender.com/boat/toggle_keyword_or_target_state?${params.toString()}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) throw new Error("Failed to update keyword status");
            updateKeywordStatus(campaignType, keywordId, targetId, adGroupId, campaignId);
            handleSnackbarOpen("Status updated successfully!", "success");
        } catch (error) {
            console.error("Error updating campaign status:", error);
            handleSnackbarOpen("Failed to update status!", "error");
        } finally {
            setUpdatingKeywords(prev => {
                const newState = { ...prev };
                delete newState[campaignId];
                delete newState[campaignType];
                delete newState[adGroupId];
                delete newState[keywordId];
                delete newState[targetId];
                return newState;
            });
        }
    };

    return (
        <React.Fragment>
            <Dialog open={confirmation.show} onClose={() => setConfirmation({ show: false, campaignType: null, keywordId: null, targetId: null, adGroupId: null, campaignId: null })}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>Are you sure you want to {confirmation.newStatus ? "activate" : "pause"} this campaign?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmation({ show: false, campaignType: null, keywordId: null, targetId: null, adGroupId: null, campaignId: null })}>Cancel</Button>
                    <Button onClick={confirmStatusChange} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>
            <TrendsModal
                showTrendsModal={showTrendsModal}
                setShowTrendsModal={setShowTrendsModal} />
            <div className="shadow-box-con-keywords aggregated-view-con">
                <div className="datatable-con-keywords">
                    <MuiDataTableComponent
                        isLoading={isLoading}
                        isExport={true}
                        columns={columns}
                        data={keywordsData.data || []} />
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

export default KeywordsComponent;