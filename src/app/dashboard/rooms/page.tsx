"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { rooms as staticRooms } from "@/lib/dummy-data";
import { FiPrinter, FiPlus, FiX, FiLink, FiCheck, FiUser, FiCalendar, FiDollarSign, FiUpload, FiEye, FiPhone, FiMapPin, FiCreditCard, FiTrash2, FiArrowLeft, FiArrowRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbQrcode } from "react-icons/tb";
import Link from "next/link";
import QrCodeSvg from "@/components/QrCodeSvg";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  occupied: { bg: "var(--status-preparing-bg)", color: "var(--status-preparing)" },
  vacant: { bg: "var(--status-ready-bg)", color: "var(--status-ready)" },
  cleaning: { bg: "var(--status-pending-bg)", color: "var(--status-pending)" },
};

const formatDateTime = (dtStr: string) => {
  if (!dtStr) return "";
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dtStr;
  }
};

const getLocalDatetimeString = (dateObj: Date) => {
  const tzOffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
};

const getIdValidationMessage = (type: string, val: string) => {
  if (!val) return "";
  const clean = val.replace(/[\s-]/g, "").toUpperCase();
  switch (type) {
    case "Aadhaar":
      return /^\d{12}$/.test(clean) ? "" : "Aadhaar must be exactly 12 digits (only numbers).";
    case "PAN Card":
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean) ? "" : "PAN format must be 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).";
    case "Passport":
      return /^[A-Z]{1}[0-9]{7}$/.test(clean) ? "" : "Passport must be 1 letter followed by 7 digits (e.g. A1234567).";
    case "Driving License":
      return /^[A-Z]{2}[0-9]{13}$/.test(clean) ? "" : "Driving License must be 2 letters followed by 13 digits (e.g. DL1420110012345).";
    case "Voter ID":
      return /^[A-Z]{3}[0-9]{7}$/.test(clean) ? "" : "Voter ID must be 3 letters followed by 7 digits (e.g. ABC1234567).";
    default:
      return "";
  }
};

interface AdultGuest {
  name: string;
  mobile: string;
  idType: string;
  idNumber: string;
  idPhotoFront: string | null;
  idPhotoBack: string | null;
  passportCountry?: string;
}

interface ChildGuest {
  name: string;
  age: string;
}

export default function RoomsPage() {
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [selectedRoomQr, setSelectedRoomQr] = useState<any | null>(null);

  // Database Bookings State
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Check-In Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  // Check-In Wizard Form Inputs
  const [selectedRoomForCheckIn, setSelectedRoomForCheckIn] = useState<any | null>(null);

  // Step 1: Group Check-in States
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [adultsList, setAdultsList] = useState<AdultGuest[]>([
    { name: "", mobile: "", idType: "Aadhaar", idNumber: "", idPhotoFront: null, idPhotoBack: null, passportCountry: "" }
  ]);
  const [childrenList, setChildrenList] = useState<ChildGuest[]>([]);
  const [expandedGuestIdx, setExpandedGuestIdx] = useState(0);
  const [address, setAddress] = useState("");
  const [matchedReturningGuest, setMatchedReturningGuest] = useState<any | null>(null);

  // Step 2: Stay Details
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [tariff, setTariff] = useState(2000);
  const [hasExtraBed, setHasExtraBed] = useState(false);
  const [extraBedCharge, setExtraBedCharge] = useState(500);
  const [discount, setDiscount] = useState(0);

  // Step 3: Payment & Confirmation
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [advancePaid, setAdvancePaid] = useState(0);
  const [bookingSource, setBookingSource] = useState("Walk-in");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings?status=active");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    resetFormStates();
  }, []);

  const resetFormStates = () => {
    setAdults(1);
    setChildren(0);
    setAdultsList([{ name: "", mobile: "", idType: "Aadhaar", idNumber: "", idPhotoFront: null, idPhotoBack: null, passportCountry: "" }]);
    setChildrenList([]);
    setExpandedGuestIdx(0);
    setAddress("");
    setMatchedReturningGuest(null);
    setTariff(2000);
    setHasExtraBed(false);
    setExtraBedCharge(500);
    setDiscount(0);
    setPaymentMode("Cash");
    setAdvancePaid(0);
    setBookingSource("Walk-in");
    setCurrentStep(1);

    setCheckInDate(getLocalDatetimeString(new Date()));
    setCheckOutDate(getLocalDatetimeString(new Date(Date.now() + 86400000)));
  };

  // Adults counter adjust
  const handleAdultsChange = (newCount: number) => {
    if (newCount < 1) return;
    setAdults(newCount);
    setAdultsList((prev) => {
      const list = [...prev];
      if (newCount > list.length) {
        for (let i = list.length; i < newCount; i++) {
          list.push({ name: "", mobile: "", idType: "Aadhaar", idNumber: "", idPhotoFront: null, idPhotoBack: null, passportCountry: "" });
        }
      } else if (newCount < list.length) {
        list.splice(newCount);
      }
      return list;
    });
    setExpandedGuestIdx(newCount - 1);
  };

  // Children counter adjust
  const handleChildrenChange = (newCount: number) => {
    if (newCount < 0) return;
    setChildren(newCount);
    setChildrenList((prev) => {
      const list = [...prev];
      if (newCount > list.length) {
        for (let i = list.length; i < newCount; i++) {
          list.push({ name: "", age: "" });
        }
      } else if (newCount < list.length) {
        list.splice(newCount);
      }
      return list;
    });
  };

  // Returning Guest Autofill Logic
  const primaryMobile = adultsList[0]?.mobile || "";
  useEffect(() => {
    if (primaryMobile.length === 10) {
      const match = bookings.find((b) => b.mobileNumber === primaryMobile);
      if (match) {
        setMatchedReturningGuest(match);
      } else {
        setMatchedReturningGuest(null);
      }
    } else {
      setMatchedReturningGuest(null);
    }
  }, [primaryMobile, bookings]);

  const autofillPrimaryGuest = () => {
    if (matchedReturningGuest) {
      setAdultsList((prev) => {
        const list = [...prev];
        list[0] = {
          name: matchedReturningGuest.guestName,
          mobile: matchedReturningGuest.mobileNumber,
          idType: matchedReturningGuest.idType || "Aadhaar",
          idNumber: matchedReturningGuest.idNumber || "",
          idPhotoFront: matchedReturningGuest.idPhotoFront || null,
          idPhotoBack: matchedReturningGuest.idPhotoBack || null,
          passportCountry: matchedReturningGuest.passportCountry || "",
        };
        return list;
      });
      setAddress(matchedReturningGuest.address || "");
      triggerToast(`Autofilled profile for returning guest ${matchedReturningGuest.guestName}!`);
      setMatchedReturningGuest(null);
    }
  };

  // Date Logic & Tariff Calculations
  const checkInTime = new Date(checkInDate).getTime();
  const checkOutTime = new Date(checkOutDate).getTime();
  const nightsCount = Math.max(
    1,
    Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24))
  );
  const isCheckoutValid = checkOutTime > checkInTime;

  const activeExtraBedCharge = hasExtraBed ? extraBedCharge : 0;
  const roomCostTotal = tariff * nightsCount;
  const taxableSubtotal = Math.max(0, roomCostTotal + activeExtraBedCharge - discount);
  const gstRate = tariff < 7500 ? 0.12 : 0.18;
  const gstAmount = Math.round(taxableSubtotal * gstRate);
  const finalPayable = taxableSubtotal + gstAmount;

  // Validation Checks for all steps
  const isStep1Valid = adultsList.every((guest, idx) => {
    const isNameValid = guest.name.trim().length > 0;
    const isIdValid = guest.idNumber.trim().length > 0 && getIdValidationMessage(guest.idType, guest.idNumber) === "";
    const isPassportCountryValid = guest.idType !== "Passport" || (guest.passportCountry && guest.passportCountry.trim().length > 0);

    if (idx === 0) {
      return isNameValid && isIdValid && isPassportCountryValid && /^\d{10}$/.test(guest.mobile);
    }
    return isNameValid && isIdValid && isPassportCountryValid;
  });

  const isStep2Valid = isCheckoutValid && tariff > 0;

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid || !isStep2Valid) {
      alert("Please ensure Guest Info & Stay Details steps are valid.");
      return;
    }

    setIsSubmitting(true);
    const bookingPayload = {
      roomId: selectedRoomForCheckIn.id,
      roomNumber: selectedRoomForCheckIn.number,
      guestName: adultsList[0].name,
      mobileNumber: adultsList[0].mobile,
      idType: adultsList[0].idType,
      idNumber: adultsList[0].idNumber,
      idPhotoFront: adultsList[0].idPhotoFront,
      idPhotoBack: adultsList[0].idPhotoBack,
      passportCountry: adultsList[0].passportCountry || null,
      address,
      adults,
      children,
      coGuests: {
        companions: adultsList.slice(1),
        children: childrenList,
      },
      checkInDate,
      checkOutDate,
      price: finalPayable,
      paymentMode,
      advancePaid,
      bookingSource,
      tariff,
      extraCharge: activeExtraBedCharge,
      gst: gstAmount,
      discount,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (res.ok) {
        triggerToast(`Group checked in successfully to Room ${selectedRoomForCheckIn.number}!`);
        await fetchBookings();
        setSelectedRoomForCheckIn(null);
        resetFormStates();
      }
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (bookingId: number, roomNumber: string) => {
    if (!confirm(`Are you sure you want to check out Room ${roomNumber}?`)) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: "checked_out" }),
      });

      if (res.ok) {
        triggerToast(`Room ${roomNumber} checked out and cleared.`);
        setSelectedBookingDetails(null);
        await fetchBookings();
      }
    } catch (err) {
      console.error("Check-out failed:", err);
    }
  };

  const handleCopyLink = (roomId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  return (
    <>
      <Topbar title="Rooms" />
      <main className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl mx-auto w-full font-sans select-none">

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-8 text-white rounded-lg px-5 py-3 text-[13px] font-medium shadow-lg animate-float flex items-center gap-2 z-50 bg-indigo-600">
            <FiCheck size={15} />
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Rooms & Check-In Hub</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify multiple guest IDs on check-in, set rates, and track digital register files.
            </p>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staticRooms.map((room) => {
            const activeBooking = bookings.find(
              (b) => b.roomId === room.id && b.status === "active"
            );
            const currentStatus = activeBooking ? "occupied" : room.status === "occupied" ? "vacant" : room.status;
            const style = STATUS_STYLE[currentStatus];

            return (
              <div
                key={room.id}
                className="glass-card glass-card-hover p-5 flex flex-col justify-between h-[230px]"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[17px] font-black text-zinc-950 dark:text-zinc-50 font-mono">
                        Room {room.number}
                      </p>
                      <p className="text-[11px] text-zinc-450 mt-1 font-semibold">Floor {room.floor}</p>
                    </div>
                    <span
                      className="rounded-xl px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest font-mono border"
                      style={{
                        backgroundColor: style.bg,
                        color: style.color,
                        borderColor: `${style.color}15`,
                      }}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  {activeBooking ? (
                    <div className="mt-4 p-2.5 rounded-xl bg-zinc-50/70 border border-zinc-150 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-800 font-semibold truncate">
                        <FiUser className="text-zinc-400 shrink-0" size={12} />
                        <span>{activeBooking.guestName}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-450 font-medium">
                        <span>Phone: {activeBooking.mobileNumber}</span>
                        <span className="font-bold">₹{Number(activeBooking.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-450 mt-4 leading-normal">
                      Room is vacant, sanitized, and ready for onboarding.
                    </p>
                  )}
                </div>

                <div className="border-t pt-3.5 mt-4 flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
                  {activeBooking ? (
                    <>
                      <button
                        onClick={() => setSelectedBookingDetails(activeBooking)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface/40 hover:bg-surface-inset text-[11px] font-bold text-muted hover:text-foreground py-2 cursor-pointer transition-all duration-200"
                      >
                        <FiEye size={12} />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => handleCheckOut(activeBooking.id, room.number)}
                        className="flex-1 py-2 text-[11px] font-bold text-background rounded-xl bg-primary hover:bg-primary/90 transition-all cursor-pointer text-center"
                      >
                        Check Out
                      </button>
                      <button
                        onClick={() => setSelectedRoomQr(room)}
                        className="border border-border/85 bg-surface/40 p-2 rounded-xl text-muted hover:text-primary hover:bg-surface-inset transition-colors cursor-pointer"
                        title="QR Code"
                      >
                        <TbQrcode size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedRoomForCheckIn(room);
                          resetFormStates();
                        }}
                        className="flex-1 py-2 text-[11px] font-bold text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all cursor-pointer text-center shadow-sm active:scale-[0.98]"
                      >
                        Check In Guest
                      </button>
                      <button
                        onClick={() => setSelectedRoomQr(room)}
                        className="border border-border/85 bg-surface/40 p-2 rounded-xl text-muted hover:text-primary hover:bg-surface-inset transition-colors cursor-pointer"
                        title="QR Code"
                      >
                        <TbQrcode size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL 1: CHECK-IN STEPPER WIZARD */}
      {selectedRoomForCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto bg-white border-border/40"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-mono">
                  New Check-In: Room {selectedRoomForCheckIn.number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoomForCheckIn(null)}
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:bg-slate-50 font-bold"
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-between py-2.5 px-4 bg-zinc-50 rounded-xl border border-zinc-100 text-xs font-semibold">
              <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? "text-indigo-600" : "text-zinc-400"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? "bg-indigo-100 text-indigo-600" : "bg-zinc-200"}`}>1</span>
                <span>Guest Info</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-zinc-200 relative">
                <div className={`absolute left-0 top-0 h-full bg-indigo-600 transition-all ${currentStep >= 2 ? "w-full" : "w-0"}`}></div>
              </div>
              <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? "text-indigo-600" : "text-zinc-400"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? "bg-indigo-100 text-indigo-600" : "bg-zinc-200"}`}>2</span>
                <span>Stay Details</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-zinc-200 relative">
                <div className={`absolute left-0 top-0 h-full bg-indigo-600 transition-all ${currentStep >= 3 ? "w-full" : "w-0"}`}></div>
              </div>
              <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? "text-indigo-600" : "text-zinc-400"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? "bg-indigo-100 text-indigo-600" : "bg-zinc-200"}`}>3</span>
                <span>Payment</span>
              </div>
            </div>

            {/* STEP 1: GUEST INFO */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-float">
                <div className="p-3.5 rounded-xl border border-zinc-150 bg-zinc-50/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800">Recording details for:</span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {adults} adults, {children} children
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200">
                      <span className="text-xs font-semibold text-zinc-500">Adults *</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(Math.max(1, adults - 1))}
                          className="h-6 w-6 rounded-lg border flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-zinc-800 font-mono">{adults}</span>
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(adults + 1)}
                          className="h-6 w-6 rounded-lg border flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200">
                      <span className="text-xs font-semibold text-zinc-500">Children</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(Math.max(0, children - 1))}
                          className="h-6 w-6 rounded-lg border flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-zinc-800 font-mono">{children}</span>
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(children + 1)}
                          className="h-6 w-6 rounded-lg border flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {matchedReturningGuest && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-float">
                    <div className="text-xs text-emerald-800 font-medium font-sans">
                      Returning guest profile found for <strong>{matchedReturningGuest.guestName}</strong>!
                    </div>
                    <button
                      type="button"
                      onClick={autofillPrimaryGuest}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Autofill Profile
                    </button>
                  </div>
                )}

                {/* Collapsible Accordion Guest Cards */}
                <div className="space-y-3">
                  {adultsList.map((guest, idx) => {
                    const isExpanded = expandedGuestIdx === idx;
                    const isPrimary = idx === 0;
                    const idError = getIdValidationMessage(guest.idType, guest.idNumber);
                    const requiresDoubleSidedId = guest.idType === "Aadhaar" || guest.idType === "Driving License";
                    const isPassport = guest.idType === "Passport";

                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl bg-white overflow-hidden transition-all duration-200 ${
                          isExpanded ? "border-indigo-200 shadow-sm" : "border-zinc-200"
                        }`}
                      >
                        <div
                          onClick={() => setExpandedGuestIdx(isExpanded ? -1 : idx)}
                          className="flex items-center justify-between p-3.5 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-700 font-mono">
                              Guest {idx + 1}
                            </span>
                            {isPrimary ? (
                              <span className="rounded bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold font-mono px-2 py-0.5 text-[8px] uppercase tracking-wider">
                                Primary Guest
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-400 font-semibold truncate max-w-[150px]">
                                {guest.name || "Unnamed Companion"}
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-400">
                            {isExpanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 space-y-3.5 animate-float border-t border-zinc-100">
                            <div className="grid grid-cols-2 gap-3.5">
                              {/* Full Name */}
                              <div className="space-y-1 col-span-2 sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Enter guest name"
                                  value={guest.name}
                                  onChange={(e) => {
                                    const updated = [...adultsList];
                                    updated[idx].name = e.target.value;
                                    setAdultsList(updated);
                                  }}
                                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none bg-surface text-foreground font-semibold"
                                />
                              </div>

                              {/* Mobile Number */}
                              <div className="space-y-1 col-span-2 sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                  Mobile Number {isPrimary ? "*" : "(Optional)"}
                                </label>
                                <div className="relative">
                                  <FiPhone className="absolute left-3 top-2.5 text-zinc-400" size={13} />
                                  <input
                                    type="tel"
                                    maxLength={10}
                                    placeholder="10-digit number"
                                    value={guest.mobile}
                                    onChange={(e) => {
                                      const updated = [...adultsList];
                                      updated[idx].mobile = e.target.value.replace(/\D/g, "");
                                      setAdultsList(updated);
                                    }}
                                    className="w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs outline-none bg-surface text-foreground font-semibold"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              {/* ID Proof Type */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Proof Type *</label>
                                <select
                                  value={guest.idType}
                                  onChange={(e) => {
                                    const updated = [...adultsList];
                                    updated[idx].idType = e.target.value;
                                    updated[idx].idNumber = "";
                                    updated[idx].passportCountry = "";
                                    setAdultsList(updated);
                                  }}
                                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none bg-white font-semibold text-slate-700"
                                >
                                  <option value="Aadhaar">Aadhaar Card</option>
                                  <option value="PAN Card">PAN Card</option>
                                  <option value="Passport">Passport</option>
                                  <option value="Driving License">Driving License</option>
                                  <option value="Voter ID">Voter ID Card</option>
                                </select>
                              </div>

                              {/* ID Number */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Proof Number *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder={
                                    guest.idType === "Aadhaar"
                                      ? "e.g. 5849 2049 1029"
                                      : guest.idType === "PAN Card"
                                      ? "e.g. ABCDE1234F"
                                      : `Enter ${guest.idType} Number`
                                  }
                                  value={guest.idNumber}
                                  onChange={(e) => {
                                    const updated = [...adultsList];
                                    updated[idx].idNumber = e.target.value;
                                    setAdultsList(updated);
                                  }}
                                  className={`w-full rounded-xl border px-3.5 py-2 text-xs outline-none bg-surface text-foreground font-semibold ${
                                    idError ? "border-rose-300 focus:ring-rose-500" : "border-zinc-200 focus:ring-indigo-500"
                                  }`}
                                />
                                {idError && (
                                  <p className="text-[9px] text-rose-500 font-semibold animate-float mt-1">{idError}</p>
                                )}
                              </div>
                            </div>

                            {/* Passport Country Field */}
                            {isPassport && (
                              <div className="space-y-1 animate-float">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passport Issuing Country / Nationality *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. United Kingdom"
                                  value={guest.passportCountry || ""}
                                  onChange={(e) => {
                                    const updated = [...adultsList];
                                    updated[idx].passportCountry = e.target.value;
                                    setAdultsList(updated);
                                  }}
                                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none bg-surface text-foreground font-semibold"
                                />
                              </div>
                            )}

                            {/* ID Photo upload Front vs Back */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Upload ID Photo ({requiresDoubleSidedId ? "Front & Back Required" : "Front Required"})
                              </label>

                              <div className="grid grid-cols-2 gap-3">
                                {/* Front Image */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block text-center">Front Side</span>
                                  <div className="flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-3 bg-zinc-50/40 hover:bg-zinc-50 transition-colors relative h-[70px]">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const updated = [...adultsList];
                                            updated[idx].idPhotoFront = reader.result as string;
                                            setAdultsList(updated);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div className="text-center">
                                      <FiUpload className="mx-auto text-zinc-450" size={13} />
                                      <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Upload Front</p>
                                    </div>
                                  </div>
                                  {guest.idPhotoFront && (
                                    <div className="relative p-1 border rounded-lg bg-surface">
                                      <img src={guest.idPhotoFront} alt="Front ID" className="h-10 object-contain mx-auto" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...adultsList];
                                          updated[idx].idPhotoFront = null;
                                          setAdultsList(updated);
                                        }}
                                        className="absolute top-0.5 right-0.5 h-4 w-4 bg-rose-50 border rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer text-[10px]"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Back Image (Conditioned on Aadhaar & DL) */}
                                {requiresDoubleSidedId ? (
                                  <div className="space-y-1 animate-float">
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block text-center">Back Side</span>
                                    <div className="flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-3 bg-zinc-50/40 hover:bg-zinc-50 transition-colors relative h-[70px]">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              const updated = [...adultsList];
                                              updated[idx].idPhotoBack = reader.result as string;
                                              setAdultsList(updated);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      />
                                      <div className="text-center">
                                        <FiUpload className="mx-auto text-zinc-450" size={13} />
                                        <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Upload Back</p>
                                      </div>
                                    </div>
                                    {guest.idPhotoBack && (
                                      <div className="relative p-1 border rounded-lg bg-surface">
                                        <img src={guest.idPhotoBack} alt="Back ID" className="h-10 object-contain mx-auto" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...adultsList];
                                            updated[idx].idPhotoBack = null;
                                            setAdultsList(updated);
                                          }}
                                          className="absolute top-0.5 right-0.5 h-4 w-4 bg-rose-50 border rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-100 cursor-pointer text-[10px]"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="border border-zinc-150 border-dashed rounded-xl bg-zinc-50/15 flex items-center justify-center text-[10px] text-zinc-400 font-semibold p-3 text-center h-[70px] mt-4">
                                    Not Required
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {children > 0 && (
                  <div className="space-y-3 border-t pt-3.5 border-zinc-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Children Profiles (No IDs Required)</p>
                    <div className="space-y-3">
                      {childrenList.map((child, cIdx) => (
                        <div key={cIdx} className="p-3 border rounded-xl bg-zinc-50/20 space-y-2 relative animate-float">
                          <p className="text-[10px] font-bold text-zinc-400 font-mono">Child #{cIdx + 1}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              required
                              placeholder="Child full name"
                              value={child.name}
                              onChange={(e) => {
                                const updated = [...childrenList];
                                updated[cIdx].name = e.target.value;
                                setChildrenList(updated);
                              }}
                              className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none bg-white text-foreground font-semibold"
                            />
                            <input
                              type="number"
                              required
                              placeholder="Age (years)"
                              value={child.age}
                              onChange={(e) => {
                                const updated = [...childrenList];
                                updated[cIdx].age = e.target.value;
                                setChildrenList(updated);
                              }}
                              className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none bg-white text-foreground font-semibold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1 border-t pt-3.5 border-zinc-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Address (City, State)</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-zinc-400" size={13} />
                    <input
                      type="text"
                      placeholder="e.g. New Delhi, Delhi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-foreground font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!isStep1Valid}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer animate-float"
                  >
                    <span>Stay Details</span>
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: STAY DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-float">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-150 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-zinc-800">Room {selectedRoomForCheckIn.number}</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Floor {selectedRoomForCheckIn.floor} • Premium Suite Type</p>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-white border px-2.5 py-1 rounded-lg">Read-Only</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Check-In Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs outline-none text-foreground font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Check-Out Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs outline-none text-foreground font-semibold"
                    />
                  </div>
                </div>

                {!isCheckoutValid && (
                  <p className="text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-100 rounded-lg p-2 flex items-center gap-1.5 animate-float">
                    Warning: Check-out Date & Time must be after the check-in time.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-50/50 border rounded-xl flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-semibold">Number of Nights</span>
                    <span className="font-bold text-zinc-800 font-mono text-sm">{nightsCount}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tariff Rate (Per Night)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-zinc-400">₹</span>
                      <input
                        type="number"
                        required
                        value={tariff}
                        onChange={(e) => setTariff(Math.max(0, Number(e.target.value)))}
                        className="w-full rounded-xl border border-zinc-200 pl-7 pr-3 py-2.5 text-xs outline-none text-foreground font-bold font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-150 bg-zinc-50/20 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-700 block">Extra Bed / Person Charge</span>
                    <span className="text-[10px] text-zinc-400 font-medium">Extra charge applicable for exceeding standard suite occupancies.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasExtraBed}
                    onChange={(e) => setHasExtraBed(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {hasExtraBed && (
                  <div className="space-y-1 animate-float">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Extra Charge Amount (₹)</label>
                    <input
                      type="number"
                      value={extraBedCharge}
                      onChange={(e) => setExtraBedCharge(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none text-foreground font-bold font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flat Discount Coupon (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-zinc-450">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={discount || ""}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-zinc-200 pl-7 pr-3 py-2.5 text-xs outline-none text-foreground font-semibold"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Base Room Tariff (₹{tariff} × {nightsCount} nights)</span>
                    <span className="font-mono">₹{roomCostTotal.toLocaleString("en-IN")}</span>
                  </div>
                  {hasExtraBed && (
                    <div className="flex justify-between text-zinc-500 animate-float">
                      <span>Extra Bed/Person Charge</span>
                      <span className="font-mono">₹{extraBedCharge.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-zinc-500 animate-float">
                      <span>Applied Coupon Discount</span>
                      <span className="font-mono text-emerald-600">-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>GST Taxes ({gstRate * 100}%)</span>
                    <span className="font-mono">₹{gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-black text-zinc-950 text-sm">
                    <span>Final Payable Total</span>
                    <span className="font-mono text-indigo-600">₹{finalPayable.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 px-4 py-3 text-xs font-bold hover:bg-zinc-50 cursor-pointer"
                  >
                    <FiArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!isStep2Valid}
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>Proceed to Pay</span>
                    <FiArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT & CONFIRMATION */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-float">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs outline-none bg-white font-semibold text-slate-700"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI Transfer</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Pay Later">Pay Later (Ledger)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking Source *</label>
                    <select
                      value={bookingSource}
                      onChange={(e) => setBookingSource(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs outline-none bg-white font-semibold text-slate-700"
                    >
                      <option value="Walk-in">Walk-in Client</option>
                      <option value="Online">Online Booking</option>
                      <option value="Travel Agent">Travel Agent Agency</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Advance Amount Paid (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-zinc-450">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={advancePaid || ""}
                      onChange={(e) => setAdvancePaid(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-zinc-200 pl-7 pr-3 py-2.5 text-xs outline-none text-foreground font-semibold"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-150 bg-indigo-50/20 space-y-1.5 text-xs text-zinc-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Billable Price:</span>
                    <span className="font-bold text-zinc-900 font-mono">₹{finalPayable.toLocaleString("en-IN")}</span>
                  </div>
                  {advancePaid > 0 && (
                    <div className="flex justify-between font-medium text-indigo-700 animate-float">
                      <span>Advance Payment Settled:</span>
                      <span className="font-bold font-mono">-₹{advancePaid.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-indigo-100 font-bold text-[13px] text-indigo-800">
                    <span>Net Balance Payable:</span>
                    <span className="font-mono font-black">₹{Math.max(0, finalPayable - advancePaid).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-200 text-zinc-700 px-4 py-3 text-xs font-bold hover:bg-zinc-50 cursor-pointer"
                  >
                    <FiArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isStep1Valid || !isStep2Valid}
                    onClick={handleCheckInSubmit}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white px-6 py-3 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>Settle Group Check-In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: GUEST DETAILS VISUALIZER ACCORDION */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto bg-white border-border/40"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-slate-800 font-mono">
                Booking Details: Room {selectedBookingDetails.roomNumber}
              </h3>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:bg-slate-50 font-bold"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Primary Guest Info */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-150 rounded-xl">
                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold">
                  <FiUser size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-zinc-900">{selectedBookingDetails.guestName}</h4>
                  <p className="text-[10px] text-zinc-450 font-semibold mt-0.5">Primary Guest • Mobile: {selectedBookingDetails.mobileNumber}</p>
                </div>
              </div>

              {/* Data fields */}
              <div className="space-y-2 border-b pb-3 border-zinc-100">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-medium">Guest Identity ({selectedBookingDetails.idType}):</span>
                  <span className="font-semibold text-zinc-850">{selectedBookingDetails.idNumber}</span>
                </div>
                {selectedBookingDetails.passportCountry && (
                  <div className="flex justify-between py-1 animate-float">
                    <span className="text-zinc-500 font-medium">Passport Country:</span>
                    <span className="font-semibold text-zinc-800">{selectedBookingDetails.passportCountry}</span>
                  </div>
                )}
                {selectedBookingDetails.address && (
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500 font-medium">Address:</span>
                    <span className="font-semibold text-zinc-800">{selectedBookingDetails.address}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-medium">Check-In:</span>
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <FiCalendar size={12} className="text-zinc-400" />
                    {formatDateTime(selectedBookingDetails.checkInDate)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-medium">Check-Out:</span>
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <FiCalendar size={12} className="text-zinc-400" />
                    {formatDateTime(selectedBookingDetails.checkOutDate)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-medium">Guests Count:</span>
                  <span className="font-semibold text-zinc-800">
                    {selectedBookingDetails.adults} Adults {selectedBookingDetails.children > 0 && `• ${selectedBookingDetails.children} Children`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 font-medium">Booking Source:</span>
                  <span className="font-semibold text-zinc-800">{selectedBookingDetails.bookingSource}</span>
                </div>
              </div>

              {/* Tariff summary card */}
              <div className="p-3.5 border border-zinc-150 rounded-xl bg-zinc-50/50 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settlement Financials</p>
                <div className="flex justify-between text-zinc-500">
                  <span>Room Tariff:</span>
                  <span className="font-mono">₹{Number(selectedBookingDetails.tariff).toLocaleString("en-IN")}</span>
                </div>
                {Number(selectedBookingDetails.extraCharge) > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Extra Bed Charge:</span>
                    <span className="font-mono">₹{Number(selectedBookingDetails.extraCharge).toLocaleString("en-IN")}</span>
                  </div>
                )}
                {Number(selectedBookingDetails.discount) > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Discounts:</span>
                    <span className="font-mono text-emerald-600">-₹{Number(selectedBookingDetails.discount).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>GST Taxes:</span>
                  <span className="font-mono">₹{Number(selectedBookingDetails.gst).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t font-black text-zinc-950 text-sm">
                  <span>Total Paid (via {selectedBookingDetails.paymentMode}):</span>
                  <span className="font-mono text-indigo-600">₹{Number(selectedBookingDetails.price).toLocaleString("en-IN")}</span>
                </div>
                {Number(selectedBookingDetails.advancePaid) > 0 && (
                  <div className="flex justify-between text-[11px] font-medium text-indigo-700">
                    <span>Advance Payment Settled:</span>
                    <span className="font-mono">₹{Number(selectedBookingDetails.advancePaid).toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              {/* Primary ID Photos Visualizer (Front & Back) */}
              {(selectedBookingDetails.idPhotoFront || selectedBookingDetails.idPhotoBack) && (
                <div className="space-y-2 border-b pb-3 border-zinc-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Guest ID Card Scans</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {selectedBookingDetails.idPhotoFront && (
                      <div className="p-1 border rounded-lg bg-white flex flex-col items-center">
                        <span className="text-[7px] text-zinc-400">Front</span>
                        <img src={selectedBookingDetails.idPhotoFront} alt="Front ID" className="h-16 object-contain rounded mt-0.5" />
                      </div>
                    )}
                    {selectedBookingDetails.idPhotoBack && (
                      <div className="p-1 border rounded-lg bg-white flex flex-col items-center">
                        <span className="text-[7px] text-zinc-400">Back</span>
                        <img src={selectedBookingDetails.idPhotoBack} alt="Back ID" className="h-16 object-contain rounded mt-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Co-Guests & Children details */}
              {(() => {
                const parsed = typeof selectedBookingDetails.coGuests === "string"
                  ? JSON.parse(selectedBookingDetails.coGuests)
                  : (selectedBookingDetails.coGuests || {});

                const companions = parsed.companions || [];
                const ch = parsed.children || [];

                return (
                  <div className="space-y-3.5">
                    {companions.length > 0 && (
                      <div className="space-y-2 border-b pb-3 border-zinc-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Co-Guests / Companions ({companions.length})</label>
                        <div className="space-y-3 mt-2">
                          {companions.map((cg: any, idx: number) => (
                            <div key={idx} className="p-3 border border-zinc-150 rounded-xl bg-zinc-50/50 space-y-2">
                              <div className="flex justify-between font-bold text-zinc-800">
                                <span>{idx + 2}. {cg.name}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">{cg.idType}: {cg.idNumber}</span>
                              </div>
                              {cg.passportCountry && (
                                <p className="text-[10px] text-zinc-400 font-medium font-sans">Passport Nationality: {cg.passportCountry}</p>
                              )}

                              {/* Co-Guest Images Front / Back */}
                              {(cg.idPhotoFront || cg.idPhotoBack) && (
                                <div className="grid grid-cols-2 gap-2 mt-1.5">
                                  {cg.idPhotoFront && (
                                    <div className="p-1 border rounded-lg bg-white flex flex-col items-center">
                                      <span className="text-[7px] text-zinc-400">Front</span>
                                      <img src={cg.idPhotoFront} alt="Front ID" className="h-16 object-contain rounded mt-0.5" />
                                    </div>
                                  )}
                                  {cg.idPhotoBack && (
                                    <div className="p-1 border rounded-lg bg-white flex flex-col items-center">
                                      <span className="text-[7px] text-zinc-400">Back</span>
                                      <img src={cg.idPhotoBack} alt="Back ID" className="h-16 object-contain rounded mt-0.5" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ch.length > 0 && (
                      <div className="space-y-2 border-b pb-3 border-zinc-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Children ({ch.length})</label>
                        <div className="space-y-2 mt-2">
                          {ch.map((child: any, idx: number) => (
                            <div key={idx} className="p-2 border border-zinc-150 rounded-xl bg-zinc-50/50 flex justify-between items-center text-xs">
                              <span className="font-bold text-zinc-800">{child.name}</span>
                              <span className="text-[10px] text-zinc-400 font-semibold">Age: {child.age} yrs</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <button
                onClick={() => handleCheckOut(selectedBookingDetails.id, selectedBookingDetails.roomNumber)}
                className="w-full py-3.5 text-xs font-bold text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer text-center mt-2"
              >
                Perform Check-Out & Settle Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ORIGINAL QR CODE Modal Visualizer */}
      {selectedRoomQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl border border-border/40 animate-float">

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedRoomQr(null);
                setCopiedRoomId(null);
              }}
              className="absolute top-4 right-4 h-7 w-7 rounded-full flex items-center justify-center bg-surface-inset border border-border/60 text-muted hover:text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <FiX size={14} />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pt-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
                Interactive QR Code
              </span>

              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                Ordering Scanner for Room {selectedRoomQr.number}
              </h3>

              <p className="text-xs text-muted max-w-[240px] font-medium leading-relaxed">
                Scan to open the guest ordering menu.
              </p>

              {/* QR Vector Box */}
              <div className="p-3 bg-white border border-border/80 rounded-2xl shadow-sm">
                <QrCodeSvg value={`${window.location.origin}/order?id=${selectedRoomQr.id}`} size={160} />
              </div>

              {/* URL details */}
              <div className="w-full space-y-2">
                <p className="text-[10px] font-extrabold text-muted uppercase tracking-widest font-mono">Simulator Link</p>
                <div className="flex items-center gap-2 bg-surface-inset border border-border/50 rounded-xl px-3.5 py-2 text-xs">
                  <span className="font-mono text-muted/80 select-all truncate max-w-[200px]">
                    /order?id={selectedRoomQr.id}
                  </span>

                  <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    <button
                      onClick={() => handleCopyLink(selectedRoomQr.id, `${window.location.origin}/order?id=${selectedRoomQr.id}`)}
                      className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedRoomId === selectedRoomQr.id ? <FiCheck size={14} className="text-emerald-500" /> : <FiLink size={14} />}
                    </button>

                    <Link
                      href={`/order?id=${selectedRoomQr.id}`}
                      target="_blank"
                      className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
                      title="Simulate Guest Ordering"
                    >
                      <TbQrcode size={15} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 text-xs font-extrabold text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                >
                  Print Ticket
                </button>
                <button
                  onClick={() => {
                    setSelectedRoomQr(null);
                    setCopiedRoomId(null);
                  }}
                  className="flex-1 border border-border/80 py-3 text-xs font-bold text-muted hover:text-foreground hover:bg-surface-inset rounded-xl transition-all cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}