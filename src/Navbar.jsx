import React, { useEffect, useState, useContext, useRef } from "react";
import { Accordion } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import AvatarIcon from "./assets/icons/navbar/avatarIcon";
import BlockersIcon from "./assets/icons/navbar/blockersIcon";
import GoToInsightIcon from "./assets/icons/navbar/goToInsightIcon";
import HistoryIcon from "./assets/icons/navbar/historyIcon";
import LogoutIcon from "./assets/icons/navbar/logoutIcon";
import PerformanceOverviewIcon from "./assets/icons/navbar/performanceOverviewIcon";
import ProductIntelligentCenterIcon from "./assets/icons/navbar/productIntelligenceCenterIcon";
import RecommendationsIcon from "./assets/icons/navbar/recommendationsIcon";
import SearchTermInsightIcon from "./assets/icons/navbar/searchTermInsightIcon";
import SmartControlIcon from "./assets/icons/navbar/smartControlIcon";
import WalletIcon from "./assets/icons/navbar/walletIcon";
import { OPERATOR } from "./assets/lib/constant";
import { useNavigate } from "react-router";
import authContext from "./store/auth/authContext";
import axios from "axios";

const RedirectLink = ({ url, label, pathName, onClick }) => {
    return (
        <Link
            className={pathName === url ? "active" : ""}
            to={url}
            aria-label={pathName}
            onClick={onClick}
        >
            {label === "Campaign Compass" ? (
                <PerformanceOverviewIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "Rules" ? (
                <SmartControlIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "Search Term Insights" ? (
                <SearchTermInsightIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "Product Analytics" ? (
                <ProductIntelligentCenterIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "Negative Keywords" ? (
                <BlockersIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "Recommendations" ? (
                <RecommendationsIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "Common Reports" ? (
                <GoToInsightIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : label === "History" ? (
                <HistoryIcon
                    iconClass="me-2"
                    iconWidth="15"
                    iconHeight="15"
                    iconColor={pathName === url ? "#fff" : "#78a8df"}
                />
            ) : (
                ""
            )}
            {label}
        </Link>
    );
};

const Navbar = () => {
    const location = useLocation();
    const [operatorTypeParams, setOperatorTypeParams] = useState(location.search);
    const [operatorName, setoperatorName] = useState("");
    const [pathName, setPathName] = useState(`/`);
    const [walletBalance, setWalletBalance] = useState("N/A")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const abortControllerRef = useRef(null);

    const { username, logout } = useContext(authContext)

    useEffect(() => {
        setOperatorTypeParams(location.search);
    }, [location.search]);

    useEffect(() => {
        setPathName(`${location.pathname}${location.search}`);
        setoperatorName(new URLSearchParams(location.search).get("operator"));
    }, [location.pathname, location.search]);

    useEffect(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (operatorName !== "Amazon") {
            setWalletBalance("N/A");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            console.warn("No access token found");
            setWalletBalance("N/A");
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);

        axios
            .get(`https://react-api-script.onrender.com/boat/wallet-balance?platform=${operatorName}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                signal: controller.signal,
            })
            .then((res) => {
                const val = res.data?.data?.wallet_balance;
                setWalletBalance(val !== undefined ? formatCurrency(val) : "N/A");
            })
            .catch((err) => {
                console.error("Wallet fetch failed:", err);
                setWalletBalance("N/A");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [operatorName]);

    const onLogoutClick = () => {
        logout()
        navigate("/login");
    };

    const formatCurrency = (amount) => {
        if (!amount) return "₹0";
        return "₹" + Number(amount).toLocaleString("en-IN");
    };

    return (
        <React.Fragment>
            <div className="left-navbar-main-con">
                <div className="nav-logo-header text-center">
                    <img
                        src="../images/logo-white.png"
                        width="150"
                        className="img-fluid"
                    />
                </div>
                <div className="nav-profile-con d-flex">
                    <AvatarIcon
                        iconClass="me-2"
                        iconWidth="30"
                        iconHeight="30"
                        iconColor="#fff"
                    />
                    <div className="profile-user-data">
                        <h3>{username}</h3>
                        <h5 className="cursor-pointer" onClick={onLogoutClick}>
                            <LogoutIcon
                                iconClass="me-1"
                                iconWidth="15"
                                iconHeight="15"
                                iconColor="#5cb850"
                            />{" "}
                            Logout
                        </h5>
                    </div>
                </div>
                <div className="nav-profile-con d-flex">
                    <WalletIcon
                        iconClass="me-2"
                        iconWidth="23"
                        iconHeight="23"
                        iconColor="#fff"
                    />
                    <div className="profile-user-data">
                        <h3>Wallet Balance</h3>
                        <h2 className="mt-2 mb-0">{loading ? "N/A" : walletBalance}</h2>
                    </div>
                </div>
                <div className="redirection-navbar-con">
                    <Accordion className="navbar-accordion">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Activation</Accordion.Header>
                            <Accordion.Body>
                                {["Amazon","Zepto","Swiggy","BigBasket"].includes(operatorName) && (
                                    <RedirectLink
                                        url={`/${operatorTypeParams === ""
                                            ? `?operator=${OPERATOR.AMAZON}`
                                            : operatorTypeParams
                                            }`}
                                        label="Campaign Compass"
                                        pathName={pathName}
                                        onClick={() =>
                                            setPathName(
                                                `/${operatorTypeParams === ""
                                                    ? `?operator=${OPERATOR.AMAZON}`
                                                    : operatorTypeParams
                                                }`
                                            )
                                        }
                                    />
                                )}
                                {["Amazon","Zepto","BigBasket"].includes(operatorName) && (
                                    <RedirectLink
                                        url={`/rules${operatorTypeParams === ""
                                            ? `?operator=${OPERATOR.AMAZON}`
                                            : operatorTypeParams
                                            }`}
                                        label="Rules"
                                        pathName={pathName}
                                        onClick={() =>
                                            setPathName(
                                                `/rules${operatorTypeParams === ""
                                                    ? `?operator=${OPERATOR.AMAZON}`
                                                    : operatorTypeParams
                                                }`
                                            )
                                        }
                                    />
                                )}
                                {["Amazon"].includes(operatorName) && (
                                    <RedirectLink
                                        url={`/keyword-analysis${operatorTypeParams === ""
                                            ? `?operator=${OPERATOR.AMAZON}`
                                            : operatorTypeParams
                                            }`}
                                        label="Search Term Insights"
                                        pathName={pathName}
                                        onClick={() =>
                                            setPathName(
                                                `/keyword-analysis${operatorTypeParams === ""
                                                    ? `?operator=${OPERATOR.AMAZON}`
                                                    : operatorTypeParams
                                                }`
                                            )
                                        }
                                    />
                                )}
                                {!["Amazon","Zepto","Swiggy","BigBasket"].includes(operatorName) && (
                                    <RedirectLink
                                        url={`/product-analytics${operatorTypeParams === ""
                                            ? `?operator=${OPERATOR.AMAZON}`
                                            : operatorTypeParams
                                            }`}
                                        label="Product Analytics"
                                        pathName={pathName}
                                        onClick={() =>
                                            setPathName(
                                                `/product-analytics${operatorTypeParams === ""
                                                    ? `?operator=${OPERATOR.AMAZON}`
                                                    : operatorTypeParams
                                                }`
                                            )
                                        }
                                    />
                                )}
                               
                               
                                {["Amazon","Zepto","Swiggy"].includes(operatorName) && (
                                    <RedirectLink
                                        url={`/negative-keywords${operatorTypeParams === ""
                                            ? `?operator=${OPERATOR.AMAZON}`
                                            : operatorTypeParams
                                            }`}
                                        label="Negative Keywords"
                                        pathName={pathName}
                                        onClick={() =>
                                            setPathName(
                                                `/negative-keywords${operatorTypeParams === ""
                                                    ? `?operator=${OPERATOR.AMAZON}`
                                                    : operatorTypeParams
                                                }`
                                            )
                                        }
                                    />
                                )}
                                

                                {["Amazon","Zepto","Swiggy"].includes(operatorName) && (
                                    <RedirectLink
                                        url={`/history${operatorTypeParams === ""
                                            ? `?operator=${OPERATOR.AMAZON}`
                                            : operatorTypeParams
                                            }`}
                                        label="History"
                                        pathName={pathName}
                                        onClick={() =>
                                            setPathName(
                                                `/history${operatorTypeParams === ""
                                                    ? `?operator=${OPERATOR.AMAZON}`
                                                    : operatorTypeParams
                                                }`
                                            )
                                        }
                                    />
                                )}


                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Navbar;
