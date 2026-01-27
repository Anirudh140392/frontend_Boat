import React, { useState } from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Check } from "@mui/icons-material";

const BudgetCell = ({ value, campaignId, campaignName, onUpdate, platform, onSnackbarOpen, campaignType }) => {
    const [budget, setBudget] = useState(value);
    const [isUpdating, setIsUpdating] = useState(false)

    const handleBudgetChange = (e) => {
        setBudget(e.target.value);
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("No access token found");
            setIsUpdating(true)
            const params = new URLSearchParams({
                platform: platform,
                campaign_name: campaignName,
                campaign_type: campaignType,
                campaign_id: campaignId,
                new_budget: budget
            });
            const response = await fetch(`https://react-api-script.onrender.com/boat/update_campaign_budget?${params.toString()}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to update budget");

            const updatedData = await response.json();
            onUpdate(campaignId, campaignName, campaignType, budget);

            onSnackbarOpen("Budget updated successfully!", "success");
        } catch (error) {
            console.error("Error updating budget:", error);

            onSnackbarOpen("Failed to update budget!", "error");
        } finally {
            setIsUpdating(false)
        }
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 1, width: "100%", height: "100%" }}>
            <TextField
                type="number"
                variant="outlined"
                size="small"
                value={budget}
                onChange={handleBudgetChange}
                sx={{ width: "140px" }}
                disabled={status === "ABORTED"}
            />
            <IconButton color="primary" onClick={handleUpdate}>
                {isUpdating ? <CircularProgress size={24} /> : <Check />}
            </IconButton>
        </Box>
    );
};

export default BudgetCell;
