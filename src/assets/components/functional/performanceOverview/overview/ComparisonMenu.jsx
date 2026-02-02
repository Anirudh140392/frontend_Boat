import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Chip,
    Divider,
    IconButton,
    Popover,
} from "@mui/material";
import { X, Plus, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

const PRESETS = [
    { id: "last_week", label: "Last Week" },
    { id: "last_month", label: "Last Month" },
    { id: "mtd", label: "MTD" },
    { id: "last_3_months", label: "Last 3M" },
    { id: "ytd", label: "YTD" },
];

const ComparisonMenu = ({ selectedPeriods, onApply, onClose }) => {
    // selectedPeriods can be null or a single string like "mtd" or "custom:..."
    const [tempSelected, setTempSelected] = useState(selectedPeriods?.[0] || null);

    // Custom Date Range State
    const [anchorEl, setAnchorEl] = useState(null);
    const [customRange, setCustomRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const handleCustomClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCustomClose = () => {
        setAnchorEl(null);
    };

    const addCustomRange = () => {
        const start = format(customRange[0].startDate, "yyyy-MM-dd");
        const end = format(customRange[0].endDate, "yyyy-MM-dd");
        const customId = `custom:${start}_${end}`;

        setTempSelected(customId);
        handleCustomClose();
    };

    const togglePreset = (id) => {
        setTempSelected(prev => prev === id ? null : id);
    };

    const removePeriod = () => {
        setTempSelected(null);
    };

    const isCustom = tempSelected?.startsWith("custom:");

    return (
        <Box sx={{ p: 2, minWidth: 320, borderRadius: "16px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select Comparison Period
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <X size={16} />
                </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {PRESETS.map((preset) => {
                    const isSelected = tempSelected === preset.id;
                    return (
                        <Chip
                            key={preset.id}
                            label={preset.label}
                            onClick={() => togglePreset(preset.id)}
                            variant={isSelected ? "filled" : "outlined"}
                            color={isSelected ? "primary" : "default"}
                            sx={{
                                borderRadius: "12px",
                                bgcolor: isSelected ? "#F3E8FF" : "transparent",
                                color: isSelected ? "#7C3AED" : "inherit",
                                borderColor: isSelected ? "#7C3AED" : "#E2E8F0",
                                "&:hover": {
                                    bgcolor: isSelected ? "#E9D5FF" : "#F8FAFC",
                                },
                            }}
                            icon={isSelected ? <Box sx={{ ml: 1, display: 'flex' }}>✓</Box> : null}
                        />
                    );
                })}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>
                        Custom Period
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<Plus size={14} />}
                        onClick={handleCustomClick}
                        sx={{ textTransform: "none", color: "#7C3AED", fontWeight: 600 }}
                    >
                        {isCustom ? "Change Custom" : "Add Custom"}
                    </Button>
                </Box>

                {!isCustom ? (
                    <Typography variant="caption" color="textSecondary" sx={{ fontStyle: "italic" }}>
                        No custom period selected
                    </Typography>
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        <Chip
                            label={tempSelected.replace("custom:", "").replace("_", " to ")}
                            onDelete={removePeriod}
                            size="small"
                            sx={{ borderRadius: "8px", bgcolor: "#F1F5F9" }}
                        />
                    </Box>
                )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    onClick={() => onApply(tempSelected ? [tempSelected] : [])}
                    sx={{
                        bgcolor: "#7C3AED",
                        borderRadius: "8px",
                        textTransform: "none",
                        px: 4,
                        "&:hover": { bgcolor: "#6D28D9" },
                    }}
                >
                    Apply
                </Button>
            </Box>

            {/* CUSTOM DATE Range Selector Popover */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCustomClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
                PaperProps={{ sx: { p: 1, borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" } }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setCustomRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={customRange}
                        rangeColors={["#7C3AED"]}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                        <Button variant="contained" size="small" onClick={addCustomRange} sx={{ bgcolor: "#7C3AED" }}>
                            Add Range
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
};

export default ComparisonMenu;
