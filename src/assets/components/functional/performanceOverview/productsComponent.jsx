import React, { useContext, useEffect,useMemo, useState, useRef } from "react";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import '../../../styles/campaignsComponent/campaignsComponent.less';
import overviewContext from "../../../../store/overview/overviewContext";
import { useSearchParams } from "react-router";
import ColumnPercentageDataComponent from "../../common/columnPercentageDataComponent";
import OnePercentageDataComponent from "../../common/onePercentageComponent";
import { Switch, Button, Box } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Snackbar, Alert } from "@mui/material";
import NewPercentageDataComponent from "../../common/newPercentageDataComponent";

const ProductsComponent = () => {

    const dataContext = useContext(overviewContext)
    //const { dateRange, formatDate } = dataContext
     const { dateRange, brands, getBrandsData, formatDate } = dataContext
   

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

    const [productsData, setProductsData] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [updatingProduct, setUpdatingProduct] = useState({});
    const [confirmation, setConfirmation] = useState({ show: false, campaignId: null, currentStatus: null, adGroupId: null, advertisedProductName: null, advertisedFsnId: null, campaignName: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const STATUS_OPTIONS = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Paused' }
    ]

    const ProductsColumnAmazon = [
         {
            field: "asin",
            headerName: "ASIN",
           
            minWidth: 200
        },
        {
            field: "product_title",
            headerName: "PRODUCT",
            renderCell: (params) => (
                <a href={params.row.product_url} target="_blank"
                    rel="noopener noreferrer">{params.row.product_title}</a>
            ),
            minWidth: 200
        },
        /*{
            field: "status",
            headerName: "STATUS",
            minWidth: 100,
            renderCell: (params) => {
                const productKey = getProductKey(params.row.advertised_fsn_id, params.row.ad_group_id);
                if (updatingProduct[productKey]) {
                    return (
                        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <CircularProgress size={24} />
                        </Box>
                    );
                }
                return (
                    <Switch
                        disabled={params.row.status_label === "Archived" || params.row.status_label === ""}
                        checked={params.row.status === 1}
                        onChange={() => handleToggle(params.row.campaign_id, params.row.status, params.row.ad_group_id, params.row.advertised_product_name, params.row.advertised_fsn_id, params.row.campaign_name)}
                    />
                )
            },
            type: "singleSelect",
            valueOptions: STATUS_OPTIONS
        },*/
        /*{
            field: "advertised_fsn_id",
            headerName: "FSN ID",
            minWidth: 180
        },
        {
            field: "ad_group_name",
            headerName: "AD GROUP",
            minWidth: 150,
        },*/
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 150,
        },

         {
            field: "ad_group_name",
            headerName: "AD GROUP",
            minWidth: 150,
        },
        /*{
            field: "ad_type",
            headerName: "AD TYPE",
            minWidth: 100,
        },*/
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
            hideable: false
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
            hideable: false
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
            field: "clicks_x",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks_x} percentValue={params.row.clicks_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "orders_x",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.orders_x} percentValue={params.row.orders_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "ctr_x",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ctr_x} percentValue={params.row.ctr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "ctr_diff",
            headerName: "CTR % CHANGE",
            hideable: false
        },
        {
            field: "cpc_x",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpc_x} percentValue={params.row.cpc_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "cvr_x",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cvr_x} percentValue={params.row.cvr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "roas_x",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas_x} percentValue={params.row.roas_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "acos_x",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <columnPercentageDataComponent mainValue={params.row.acos_x} percentValue={params.row.acos_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
       {
            field: "aov_x",
            headerName: "AOV",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.aov_x} percentValue={params.row.aov_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        /*{
            field: "views",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.views} percentValue={params.row.views_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "views_diff",
            headerName: "IMPRESSIONS % CHANGE",
            hideable: false
        },
        {
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "clicks_diff",
            headerName: "CLICKS % CHANGE",
            hideable: false
        },
        {
            field: "cpc",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpc} percentValue={params.row.cpc_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "cpc_diff",
            headerName: "CPC % CHANGE",
            hideable: false
        },
        {
            field: "orders",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.orders} percentValue={params.row.orders_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "orders_diff",
            headerName: "ORDERS % CHANGE",
            hideable: false
        },
        {
            field: "indirect_sales",
            headerName: "INDIRECT SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.indirect_sales} percentValue={params.row.indirect_sales_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "indirect_sales_diff",
            headerName: "INDIRECT SALES % CHANGE",
            hideable: false
        },
        {
            field: "acos",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.acos} percentValue={params.row.acos_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "acos_diff",
            headerName: "ACOS % CHANGE",
            hideable: false
        },
        {
            field: "cvr",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cvr} percentValue={params.row.cvr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "cvr_diff",
            headerName: "CVR % CHANGE",
            hideable: false
        },
        {
            field: "aov",
            headerName: "AOV",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.aov} percentValue={params.row.aov_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "aov_diff",
            headerName: "AOV % CHANGE",
            hideable: false
        },*/
    ];

     const ProductsColumnBigBasket = [
        {
            field: "Product Name",
            headerName: "PRODUCT",
            minWidth: 200
        },
       
         
        /*{
            field: "advertised_fsn_id",
            headerName: "FSN ID",
            minWidth: 180
        },
        {
            field: "ad_group_name",
            headerName: "AD GROUP",
            minWidth: 150,
        },*/

       
    {
            field: "Category",
            headerName: "CATEGORY",
            minWidth: 150,
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
          
        /*{
            field: "ad_type",
            headerName: "AD TYPE",
            minWidth: 100,
        },*/
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
            field: "Add_to_cart",
            headerName: "ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.Add_to_cart} percentValue={params.row.Add_to_cart_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "add_to_cart_rate",
            headerName: "ATC RATE",
            minWidth: 150,
            renderCell: (params) => (
                <OnePercentageDataComponent firstValue={params.row.add_to_cart_rate}/>
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
        }
        
    ];

    const ProductsColumnZepto = [
        {
            field: "product_name",
            headerName: "PRODUCT",
            minWidth: 200
        },
       
         
        /*{
            field: "advertised_fsn_id",
            headerName: "FSN ID",
            minWidth: 180
        },
        {
            field: "ad_group_name",
            headerName: "AD GROUP",
            minWidth: 150,
        },*/
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 150,
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
          
        /*{
            field: "ad_type",
            headerName: "AD TYPE",
            minWidth: 100,
        },*/
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
            field: "revenue",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.revenue} percentValue={params.row.revenue_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "orders",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.orders} secValue={params.row.orders_change} />
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
            field: "cpc",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.cpc} secValue={params.row.cpc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "cpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.cpm} secValue={params.row.cpm_change} />
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
        
        {
            field: "roas",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas} percentValue={params.row.roas_change} />
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
            field: "aov",
            headerName: "AOV",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.aov} percentValue={params.row.aov_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        
    ];

    const ProductsColumnSwiggy = [
        {
            field: "product_name",
            headerName: "PRODUCT",
            minWidth: 200
        },
        
          
        /*{
            field: "advertised_fsn_id",
            headerName: "FSN ID",
            minWidth: 180
        },
        {
            field: "ad_group_name",
            headerName: "AD GROUP",
            minWidth: 150,
        },*/
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 150,
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
          
        /*{
            field: "ad_type",
            headerName: "AD TYPE",
            minWidth: 100,
        },*/
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
                <NewPercentageDataComponent firstValue={params.row.ecpm} secValue={params.row.ecpm_change} />
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
            field: "roi",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roi} percentValue={params.row.roi_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        
    ];


    const getProductKey = (advertisedFsnId, adGroupId) => `${advertisedFsnId}_${adGroupId}`;

    const handleToggle = (campaignId, currentStatus, adGroupId, advertisedProductName, advertisedFsnId, campaignName) => {
        setConfirmation({ show: true, campaignId, currentStatus, adGroupId, advertisedProductName, advertisedFsnId, campaignName });
    };

    const updateProductStatus = (advertisedFsnId, adGroupId, newStatus) => {
        setProductsData(prevData => ({
            ...prevData,
            data: prevData.data.map(product =>
                product.advertised_fsn_id === advertisedFsnId && product.ad_group_id === adGroupId
                    ? { ...product, status: newStatus }
                    : product
            )
        }));
    };

    const confirmStatusChange = async () => {
        setConfirmation({ show: false, campaignId: null, currentStatus: null, adGroupId: null, advertisedProductName: null, advertisedFsnId: null, campaignName: null });
        const { campaignId, currentStatus, adGroupId, advertisedProductName, advertisedFsnId, campaignName } = confirmation;
        if (!campaignId) return;
        const productKey = getProductKey(advertisedFsnId, adGroupId);
        setUpdatingProduct(prev => ({ ...prev, [productKey]: true }));

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("No access token found");
            const params = new URLSearchParams({
                campaign_id: campaignId,
                ad_group_id: adGroupId,
                status: currentStatus,
                advertised_product_name: advertisedProductName,
                advertised_fsn_id: advertisedFsnId,
                campaign_name: campaignName
            });
            const url = `https://react-api-script.onrender.com/app/amazon-product-play-pause?${params.toString()}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) throw new Error("Failed to update campaign status");
            updateProductStatus(advertisedFsnId, adGroupId, currentStatus === "SERVICEABLE" ? "PAUSED" : "SERVICEABLE");
            handleSnackbarOpen("Status updated successfully!", "success");
        } catch (error) {
            console.error("Error updating campaign status:", error);
            handleSnackbarOpen("Failed to update status!", "error");
        } finally {
            setUpdatingProduct(prev => {
                const newState = { ...prev };
                delete newState[productKey];
                return newState;
            });
        }
    };

    const getProductsData = async () => {
        if (!operator) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setProductsData({});
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
            const response = await fetch(`https://react-api-script.onrender.com/boat/products?start_date=${startDate}&end_date=${endDate}&platform=${operator}`, {
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
            setProductsData(data);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Previous request aborted due to operator change.");
            } else {
                console.error("Failed to fetch products data:", error.message);
                setProductsData({});
            }
        } finally {
            setIsLoading(false);
        }
    };

     const columns = useMemo(() => {
            if (operator === "Amazon") return ProductsColumnAmazon;
    
            if (operator === "Zepto") return ProductsColumnZepto;
            if (operator === "BigBasket") return ProductsColumnBigBasket;
            if (operator === "Swiggy") return ProductsColumnSwiggy;
            return [];
        }, [operator, brands]);

    const abortControllerRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            getProductsData();
        }, 100);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearTimeout(timeout);
        }
    }, [operator, dateRange]);

    const handleSnackbarOpen = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <React.Fragment>
            <Dialog open={confirmation.show} onClose={() => setConfirmation({ show: false, campaignId: null, currentStatus: null, adGroupId: null, advertisedProductName: null, advertisedFsnId: null, campaignName: null })}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>Are you sure you want to change status of this product?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmation({ show: false, campaignId: null, currentStatus: null, adGroupId: null, advertisedProductName: null, advertisedFsnId: null, campaignName: null })}>Cancel</Button>
                    <Button onClick={confirmStatusChange} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>
            <div className="shadow-box-con-campaigns aggregated-view-con">
                <div className="datatable-con-campaigns">
                    <MuiDataTableComponent
                        isLoading={isLoading}
                        isExport={true}
                        columns={columns}
                        data={productsData?.data} />
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

export default ProductsComponent;