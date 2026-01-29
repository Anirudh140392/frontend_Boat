import React, { useState, useContext, useEffect, useRef } from "react";
import PencilEditIcon from "../../../icons/common/pencilEditIcon";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import overviewContext from "../../../../store/overview/overviewContext";
import { useSearchParams } from "react-router";
import ColumnPercentageDataComponent from '../../common/columnPercentageDataComponent';
import Typography from '@mui/material/Typography';
import { Switch, Box, Button, CircularProgress } from "@mui/material";
import NewPercentageDataComponent from "../../common/newPercentageDataComponent";
//import EditIcon from '@mui/icons-material/Edit';
//import {  TextField, IconButton} from "@mui/material";

const AdGroupsComponent = () => {
    //const [statusToggle, setStatusToggle] = useState(true)
    const { dateRange, formatDate } = useContext(overviewContext);
    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

    const [updatingStatus, setUpdatingStatus] = useState({});

    const [AdGroupData, setAdGroupData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    /* const [editRowId, setEditRowId] = useState(null);
    const [editedName, setEditedName] = useState("");*/

    const abortControllerRef = useRef(null);

    const fetchAdGroupsData = async () => {
        if (!operator) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);

        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("Missing access token");
            setIsLoading(false);
            return;
        }

        const startDate = formatDate(dateRange[0].startDate);
        const endDate = formatDate(dateRange[0].endDate);

        try {
            const response = await fetch(
                `https://react-api-script.onrender.com/boat/ad-groups?start_date=${startDate}&end_date=${endDate}&platform=Amazon`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                }
            );

            if (!response.ok) throw new Error("Failed to fetch keyword data");

            const result = await response.json();
           
            setAdGroupData(result.data || []);

        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Error fetching keyword data:", error);
                setAdGroupData([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAdGroupsData();
        }, 100);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearTimeout(timeout);
        }
    }, [operator, dateRange]);

    const handleToggle = async (campaignType, adGroupId, campaignId) => {
        const token = localStorage.getItem("accessToken");
        setUpdatingStatus(prev => ({ ...prev, [adGroupId]: true, [campaignType]: true, [campaignId]: true }));
        try {
            const params = new URLSearchParams({
                campaign_type: campaignType,
                ad_group_id: adGroupId,
                platform: operator,
                campaign_id: campaignId
            });
            const response = await fetch(`https://react-api-script.onrender.com/boat/toggle_ad_group?${params.toString()}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                 });

            if (!response.ok) throw new Error("Failed to update adgroup status");

            // Update local state
             setAdGroupData(prev =>
                prev.map(row =>
                    row.ad_group_id === adGroupId && row.campaign_id === campaignId && row.campaign_type === campaignType ? { ...row, status: row.status === 1 ? 0 : 1 } : row
                )
            );
           
        } catch (err) {
            console.error("Error updating adgroup status:", err);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [adGroupId]: false, [campaignType]: false, [campaignId]: false }));
        }
    };

    /*const handleEditClick = (row) => {
        setEditRowId(row.ad_group_id);
        setEditedName(row.ad_group_name);
    };

    const handleUpdateName = async (row) => {
        setEditRowId(null); // Exit edit mode
        const token = localStorage.getItem("accessToken");
        if (!token || editedName.trim() === "" || editedName === row.ad_group_title) return;

        try {
            const response = await fetch(`https://react-api-script.onrender.com/boat/update_ad_group_name?platform=Amazon&ad_group_id=${row.ad_group_id}&campaign_type=${encodeURIComponent(row.campaign_type)}&campaign_id=${row.campaign_id}&new_name=${encodeURIComponent(editedName)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
                }

            const result = await response.json();

            setAdGroupData((prevData) =>
                prevData.map((adGroup) =>
                    adGroup.ad_group_id === row.ad_group_id
                        ? {
                            ...adGroup,
                            ad_group_name: result.adGroups.success[0].adGroup.name,
                        }
                        : adGroup
                )
            );
        } catch (error) {
            console.error("Failed to update ad group name:", error.message);
        }
    };*/

const AdGroupsViewColumn = [
  {
    field: "Ad_Group_Name",
    headerName: "AD GROUP",
    width: 180,
    align: "left",
    headerAlign: "left",
  },

  {
    field: "status",
    headerName: "STATUS",
    width: 110,
    renderCell: (params) => (
      <Switch
        checked={params.row.status === 1}
        onChange={() =>
          handleToggle(
            params.row.type_of_sheet,
            params.row.Ad_Group_ID,
            params.row.Campaign_ID
          )
        }
      />
    ),
  },

  {
    field: "Campaign_Name_Informational_only",
    headerName: "CAMPAIGN",
    width: 260,
    align: "left",
    headerAlign: "left",
  },

  {
    field: "Spend",
    headerName: "SPENDS",
    width: 150,
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
    width: 150,
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
    width: 160,
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
    width: 140,
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
    width: 140,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.Orders}
        percentValue={params.row.Orders_diff}
      />
    ),
  },

  
  {
    field: "cvr",
    headerName: "CVR",
    width: 130,
    renderCell: (params) => (
      <NewPercentageDataComponent
        firstValue={params.row.cvr}
        secValue={params.row.cvr_diff}
      />
    ),
  },

  {
    field: "roas",
    headerName: "ROAS",
    width: 130,
    renderCell: (params) => (
      <ColumnPercentageDataComponent
        mainValue={params.row.roas}
        percentValue={params.row.roas_diff}
      />
    ),
  },

  
];


    return (
        <React.Fragment>
            <div className="shadow-box-con-keywords aggregated-view-con">
                <div className="datatable-con-keywords">
                    <MuiDataTableComponent
                        isLoading={isLoading}
                        isExport={true}
                        columns={AdGroupsViewColumn}
                        data={AdGroupData || []} />
                </div>
            </div>
        </React.Fragment>
    );
};

export default AdGroupsComponent;

