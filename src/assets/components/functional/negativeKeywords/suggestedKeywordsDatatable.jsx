import React, { useEffect, useContext, useState, useRef,useMemo } from "react";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import '../../../styles/keywordsComponent/keywordsComponent.less';
import { Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import overviewContext from "../../../../store/overview/overviewContext";
import { useSearchParams } from "react-router";
import ColumnPercentageDataComponent from "../../common/columnPercentageDataComponent";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const SuggestedKeywordsDatatable = () => {

    const { dateRange, formatDate } = useContext(overviewContext)

    const [keywordsData, setKeywordsData] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [loadingRows, setLoadingRows] = useState({});

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
            const response = await fetch(`https://react-api-script.onrender.com/boat/suggested-negative-keyword?platform=${operator}&start_date=${startDate}&end_date=${endDate}`, {
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
    }, [operator, dateRange]);

    const handleAddNegativeKeyword = async (row) => {
        const token = localStorage.getItem("accessToken");
        const uniqueKey = row.campaign_id + row.campaign_type + row.keyword_id + row.ad_group_id;

        if (!token) {
            handleSnackbarOpen("Access token missing", "error");
            return;
        }

        setLoadingRows(prev => ({ ...prev, [uniqueKey]: true }));

        const params = new URLSearchParams({
            platform: operator,
            campaign_id: row.campaign_id,
            campaign_type: row.campaign_type,
            keyword_id: row.keyword_id,
            ad_group_id: row.ad_group_id,
        });

        try {
            const response = await fetch(`https://react-api-script.onrender.com/boat/add_negative_keyword?${params.toString()}`, {
                method: "POST",
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
                    item => !(item.campaign_id === row.campaign_id && item.campaign_type === row.campaign_type && item.keyword_id === row.keyword_id && item.ad_group_id === row.ad_group_id)
                )
            }));

        } catch (error) {
            console.error("Failed to update keyword:", error.message);
            handleSnackbarOpen("Failed to add keyword as negative", "error");
        } finally {
            setLoadingRows(prev => {
                const updated = { ...prev };
                delete updated[uniqueKey];
                return updated;
            });
        }
    };

    const SuggestedKeywordsColumnAmazon = [
        {
            field: "keyword",
            headerName: "SEARCH TERM",
            minWidth: 150,
            renderCell: (params) => (
                <div className="text-icon-div cursor-pointer redirect" onClick={() => handleKeywordClick(params.row.keyword, params.row.campaign_id)}>
                    <Typography variant="body2">{params.row.keyword}</Typography>
                </div>
            ),
        },
        {
            field: "add_negative",
            headerName: "ADD NEGATIVE",
            minWidth: 150,
            renderCell: (params) => {
                const uniqueKey = params.row.campaign_id + params.row.campaign_type + params.row.keyword_id + params.row.ad_group_id;
                const isLoading = loadingRows[uniqueKey];

                return (
                    <div className="cursor-pointer">
                        {isLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <AddCircleOutlineIcon color="error" onClick={() => handleAddNegativeKeyword(params.row)} />
                        )}
                    </div>
                );
            },
            align: "center"
        },
        {
            field: "ad_group_name",
            headerName: "AD GROUP",
            minWidth: 150,
        },
        { field: "ad_type", headerName: "AD TYPE", minWidth: 150 },
        {
            field: "campaign_name",
            headerName: "CAMPAIGN NAME",
            minWidth: 200,
        },
        {
            field: "impressions_x",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions_x} percentValue={params.row.impressions_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "impressions_diff",
            headerName: "IMPRESSIONS % CHANGE",
        },
        {
            field: "clicks_x",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks_x} percentValue={params.row.clicks_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "clicks_diff",
            headerName: "CLICKS % CHANGE",
        },
        {
            field: "spend_x",
            headerName: "SPENDS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.spend_x} percentValue={params.row.spend_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "spend_diff",
            headerName: "SPENDS % CHANGE",
        },
        {
            field: "sales_x",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.sales_x} percentValue={params.row.sales_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "sales_diff",
            headerName: "SALES % CHANGE",
        },
        {
            field: "acos_x",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.acos_x} percentValue={params.row.acos_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "acos_diff",
            headerName: "ACOS % CHANGE",
        },
    ];

    const SuggestedKeywordsColumnZepto = [
        {
            field: "targeting_value",
            headerName: "SEARCH TERM",
            minWidth: 150,
            renderCell: (params) => (
                <div className="text-icon-div cursor-pointer redirect" onClick={() => handleKeywordClick(params.row.targeting_value, params.row.campaign_id)}>
                    <Typography variant="body2">{params.row.targeting_value}</Typography>
                </div>
            ),
        },
        {
            field: "add_negative",
            headerName: "ADD NEGATIVE",
            minWidth: 150,
            renderCell: (params) => {
                const uniqueKey = params.row.campaign_id + params.row.campaign_type + params.row.keyword_id + params.row.ad_group_id;
                const isLoading = loadingRows[uniqueKey];

                return (
                    <div className="cursor-pointer">
                        {isLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <AddCircleOutlineIcon color="error" onClick={() => handleAddNegativeKeyword(params.row)} />
                        )}
                    </div>
                );
            },
            align: "center"
        },
        {
            field: "campaign_name",
            headerName: "CAMPAIGN NAME",
            minWidth: 200,
        },
        {
            field: "impressions_x",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions_x} percentValue={params.row.impressions_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "impressions_diff",
            headerName: "IMPRESSIONS % CHANGE",
        },
        {
            field: "direct_atc_x",
            headerName: "DIRECT ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.direct_atc_x} percentValue={params.row.direct_atc_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "direct_atc_diff",
            headerName: "DIRECT ATC % CHANGE",
        },
        {
            field: "estimated_budget_consumed_x",
            headerName: "SPENDS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.estimated_budget_consumed_x} percentValue={params.row.estimated_budget_consumed_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "estimated_budget_consumed_diff",
            headerName: "SPENDS % CHANGE",
        },
        {
            field: "total_sales_x",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.total_sales_x} percentValue={params.row.total_sales_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "total_sales_diff",
            headerName: "SALES % CHANGE",
        },
    ];

    const SuggestedKeywordsColumnSwiggy = [
        {
            field: "keyword",
            headerName: "SEARCH TERM",
            minWidth: 150,
            renderCell: (params) => (
                <div className="text-icon-div cursor-pointer redirect" onClick={() => handleKeywordClick(params.row.keyword, params.row.campaign_id)}>
                    <Typography variant="body2">{params.row.keyword}</Typography>
                </div>
            ),
        },
        
        
        { field: "ad_type", headerName: "AD TYPE", minWidth: 150 },
        {
            field: "campaign_name",
            headerName: "CAMPAIGN NAME",
            minWidth: 200,
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
            field: "spend",
            headerName: "SPENDS",
            minWidth: 150,
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
            field: "a2c_rate",
            headerName: "ATC RATE",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.a2c_rate} percentValue={params.row.a2c_rate_change} />
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


    const handleSnackbarOpen = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const columns = useMemo(() => {
        if (operator === "Amazon") return SuggestedKeywordsColumnAmazon;
        if (operator === "Swiggy") return SuggestedKeywordsColumnSwiggy;

        if (operator === "Zepto") return SuggestedKeywordsColumnZepto;
        return [];
    }, [operator]);

    return (
        <React.Fragment>
            <div className="shadow-box-con-keywords aggregated-view-con">
                <div className="datatable-con-negative-keywords">
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

export default SuggestedKeywordsDatatable;