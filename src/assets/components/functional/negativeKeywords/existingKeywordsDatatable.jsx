import React, { useEffect, useContext, useState, useRef } from "react";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import ColumnPercentageDataComponent from "../../common/columnPercentageDataComponent";
import '../../../styles/keywordsComponent/keywordsComponent.less';
import { Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import overviewContext from "../../../../store/overview/overviewContext";
import { useSearchParams } from "react-router";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ExistingKeywordsDatatable = () => {

    const { dateRange, formatDate } = useContext(overviewContext)

    const [keywordsData, setKeywordsData] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [loadingRows, setLoadingRows] = useState({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 100,
    });
    const [totalCount, setTotalCount] = useState(0);

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

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
            const response = await fetch(`https://react-api-script.onrender.com/boat/negative-keyword?&start_date=${startDate}&end_date=${endDate}&platform=${operator}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`, {
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
            setTotalCount(data.total_count || data.count || 0); // Handle potential count field names
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
    }, [operator, dateRange, paginationModel]);

    const handleAddNegativeKeyword = async (row) => {
        const token = localStorage.getItem("accessToken");
        const uniqueKey = row.keyword_id + row.campaign_type;

        if (!token) {
            handleSnackbarOpen("Access token missing", "error");
            return;
        }

        setLoadingRows(prev => ({ ...prev, [uniqueKey]: true }));

        const params = new URLSearchParams({
            platform: operator,
            campaign_type: row.campaign_type,
            keyword_id: row.keyword_id,
        });

        try {
            const response = await fetch(`https://react-api-script.onrender.com/boat/delete_negative_keyword?${params.toString()}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            handleSnackbarOpen("Keyword added as negative successfully!", "success");

            setKeywordsData(prev => ({
                ...prev,
                data: prev.data.filter(
                    item => !(item.keyword_id === row.keyword_id && item.campaign_type === row.campaign_type)
                )
            }));

        } catch (error) {
            console.error("Failed to update keyword:", error.message);
            handleSnackbarOpen("Failed to add as negative", "error");
        } finally {
            setLoadingRows(prev => {
                const updated = { ...prev };
                delete updated[uniqueKey];
                return updated;
            });
        }
    };

    const SuggestedKeywordsColumnAmazon = [
        // ===== BASIC DETAILS =====



        {
            field: "Keyword_Text",
            headerName: "KEYWORD",
            minWidth: 160,

        },
        { field: "Match_Type", headerName: "MATCH TYPE", minWidth: 130 },
        { field: "Product", headerName: "TYPE", minWidth: 150 },




        {
            field: "Portfolio_Name_Informational_only",
            headerName: "PORTFOLIO NAME",
            minWidth: 200,
        },

        // ===== PERFORMANCE (CURRENT) =====
        {
            field: "Impressions",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Impressions} percentValue={params.row.Impressions_diff} />
            ), //type: "number", align: "left",
            //headerAlign: "left",
        },
        {
            field: "Clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Clicks} percentValue={params.row.Clicks_diff} />
            ), //type: "number", align: "left",
            //headerAlign: "left",
        },
        {
            field: "Orders",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Orders} percentValue={params.row.Orders_diff} />
            ), //type: "number", align: "left",
            //headerAlign: "left",
        },

        {
            field: "Sales",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Sales} percentValue={params.row.Sales_diff} />
            ), //type: "number", align: "left",
            //headerAlign: "left",
        },
        {
            field: "cpc",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpc} percentValue={params.row.cpc_diff} />
            ), //type: "number", align: "left",
            // headerAlign: "left",
        },
        {
            field: "cvr",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cvr} percentValue={params.row.cvr_diff} />
            ), //type: "number", align: "left",
            // headerAlign: "left",
        },


        {
            field: "roas",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas} percentValue={params.row.roas_diff} />
            ), //type: "number", align: "left",
            // headerAlign: "left",
        },

        {
            field: "acos",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.acos} percentValue={params.row.acos_diff} />
            ), //type: "number", align: "left",
            // headerAlign: "left",
        },


        {
            field: "Campaign_Name_Informational_only",
            headerName: "CAMPAIGN NAME",
            minWidth: 240,
        },


        // ===== BIDDING =====
        { field: "Bid", headerName: "KEYWORD BID", minWidth: 140 },
       

    ];




    const handleSnackbarOpen = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <React.Fragment>
            <div className="shadow-box-con-keywords aggregated-view-con">
                <div className="datatable-con-negative-keywords">
                    <MuiDataTableComponent
                        isLoading={isLoading}
                        isExport={true}
                        columns={SuggestedKeywordsColumnAmazon}
                        data={keywordsData.data || []}
                        rowCount={totalCount}
                        paginationMode="server"
                        onPaginationModelChange={setPaginationModel}
                    />
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

export default ExistingKeywordsDatatable;