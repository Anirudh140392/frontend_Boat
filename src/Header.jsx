import React, { useState, useEffect, useContext } from "react";
import { Dropdown } from "react-bootstrap";
import { Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router";

import SelectFieldComponent from "./assets/components/molecules/selectFieldComponent";
import HamburgerMenuIcon from "./assets/icons/header/hamburgerMenuIcon";
import CustomDateRangePicker from "./assets/components/molecules/customDateRangePicker";

import { OPERATOR } from "./assets/lib/constant";
import overviewContext from "./store/overview/overviewContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** ------------------ Page Heading ------------------ */
  const getPageHeading = () => {
    const path = location.pathname.replace("/", "");
    if (!path) return "Performance Overview";

    return path
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /** ------------------ Context ------------------ */
  const overviewCtx = useContext(overviewContext);

  const dateRange =
    overviewCtx?.dateRange || [{ startDate: new Date(), endDate: new Date() }];
  const formatDate = overviewCtx?.formatDate || ((d) => d.toLocaleDateString());

  /** ------------------ Operators ------------------ */
  const availableOperators = Object.values(OPERATOR);

  const queryParams = new URLSearchParams(location.search);
  const operatorFromUrl =
    queryParams.get("operator") || OPERATOR.BLINKIT;

  const [showSelectedOperator, setShowSelectedOperator] =
    useState(operatorFromUrl);

  /** ------------------ UI State ------------------ */
  const [showHeaderLogo, setShowHeaderLogo] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  /** ------------------ Effects ------------------ */
  useEffect(() => {
    navigate(`${location.pathname}?operator=${showSelectedOperator}`, {
      replace: true,
    });
  }, [showSelectedOperator]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const operator = params.get("operator");
    if (operator) setShowSelectedOperator(operator);
  }, [location.search]);

  /** ------------------ Hamburger ------------------ */
  const onHamburgerClick = () => {
    const sideNav = document.getElementsByClassName(
      "left-navbar-main-con"
    )[0];
    const mainCon = document.getElementsByClassName("main-con")[0];
    const headerCon = document.getElementsByClassName("header-main-con")[0];

    sideNav?.classList.toggle("hide-sidenavbar");
    mainCon?.classList.toggle("hide-sidenavbar");
    headerCon?.classList.toggle("hide-sidenavbar");

    setShowHeaderLogo((prev) => !prev);
  };

  /** ------------------ Client Dropdown ------------------ */
  const clientOptions = [{ label: "Boat", value: "Boat" }];

  return (
    <div className="header-main-con">
      {/* Left Section */}
      <div className="icon-heading-con">
        <span className="d-inline-block" onClick={onHamburgerClick}>
          <HamburgerMenuIcon
            iconClass="cursor-pointer"
            iconWidth="20"
            iconHeight="20"
            iconColor="#222e3c"
          />
        </span>

        <div className="card-header">
          <h1 className="page-heading">{getPageHeading()}</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="d-flex actions-con">
        {/* Operator Dropdown */}
        {location.pathname !== "/watch-tower" && (
          <Dropdown className="operator-selected-tab">
            <Dropdown.Toggle variant="white">
              {showSelectedOperator || "Select Platform"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {availableOperators.map((operator) => (
                <Dropdown.Item
                  key={operator}
                  onClick={() => setShowSelectedOperator(operator)}
                >
                  {operator}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}

        {/* Client Select */}
        <SelectFieldComponent
          isFieldLabelRequired={false}
          areaLabel="user-detail"
          fieldClass="client-select"
          isDisabled
          options={clientOptions}
        />

        {/* Date Picker */}
        <div className="text-end position-relative">
          <Box className="d-inline-flex align-items-center gap-2">
            <Button
              variant="contained"
              sx={{ color: "#0081ff", background: "#0081ff1a" }}
              onClick={() => setShowDatePicker((prev) => !prev)}
            >
              {`${formatDate(dateRange[0].startDate)} - ${formatDate(
                dateRange[0].endDate
              )}`}
            </Button>
          </Box>

          {showDatePicker && (
            <Box className="date-range-container">
              <CustomDateRangePicker
                onClose={() => setShowDatePicker(false)}
              />
            </Box>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
