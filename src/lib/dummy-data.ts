import {
  Order,
  Room,
  RestaurantTable,
  MenuCategory,
  MenuItem,
  StaffUser,
  SalesPoint,
} from "./types";

export const rooms: Room[] = [
  { id: "r1", number: "101", floor: 1, status: "occupied", qrCode: "QR-ROOM-101", ordersToday: 3 },
  { id: "r2", number: "102", floor: 1, status: "vacant", qrCode: "QR-ROOM-102", ordersToday: 0 },
  { id: "r3", number: "204", floor: 2, status: "occupied", qrCode: "QR-ROOM-204", ordersToday: 5 },
  { id: "r4", number: "205", floor: 2, status: "cleaning", qrCode: "QR-ROOM-205", ordersToday: 1 },
  { id: "r5", number: "301", floor: 3, status: "occupied", qrCode: "QR-ROOM-301", ordersToday: 2 },
  { id: "r6", number: "302", floor: 3, status: "vacant", qrCode: "QR-ROOM-302", ordersToday: 0 },
  { id: "r7", number: "103", floor: 1, status: "vacant", qrCode: "QR-ROOM-103", ordersToday: 0 },
  { id: "r8", number: "104", floor: 1, status: "vacant", qrCode: "QR-ROOM-104", ordersToday: 0 },
  { id: "r9", number: "105", floor: 1, status: "vacant", qrCode: "QR-ROOM-105", ordersToday: 0 },
  { id: "r10", number: "201", floor: 2, status: "vacant", qrCode: "QR-ROOM-201", ordersToday: 0 },
  { id: "r11", number: "202", floor: 2, status: "vacant", qrCode: "QR-ROOM-202", ordersToday: 0 },
  { id: "r12", number: "203", floor: 2, status: "vacant", qrCode: "QR-ROOM-203", ordersToday: 0 },
  { id: "r13", number: "303", floor: 3, status: "vacant", qrCode: "QR-ROOM-303", ordersToday: 0 },
  { id: "r14", number: "304", floor: 3, status: "vacant", qrCode: "QR-ROOM-304", ordersToday: 0 },
  { id: "r15", number: "305", floor: 3, status: "vacant", qrCode: "QR-ROOM-305", ordersToday: 0 },
];

export const tables: RestaurantTable[] = [
  { id: "t1", number: "Table T1", seats: 2, status: "occupied", qrCode: "QR-TABLE-T1", ordersToday: 4 },
  { id: "t2", number: "Table T2", seats: 4, status: "vacant", qrCode: "QR-TABLE-T2", ordersToday: 2 },
  { id: "t3", number: "Table T3", seats: 4, status: "reserved", qrCode: "QR-TABLE-T3", ordersToday: 0 },
  { id: "t4", number: "Table T4", seats: 6, status: "occupied", qrCode: "QR-TABLE-T4", ordersToday: 3 },
  { id: "t5", number: "Table T5", seats: 2, status: "occupied", qrCode: "QR-TABLE-T5", ordersToday: 1 },
  { id: "t6", number: "Table T6", seats: 4, status: "vacant", qrCode: "QR-TABLE-T6", ordersToday: 0 },
  { id: "t7", number: "Table T7", seats: 4, status: "vacant", qrCode: "QR-TABLE-T7", ordersToday: 0 },
  { id: "t8", number: "Table T8", seats: 6, status: "vacant", qrCode: "QR-TABLE-T8", ordersToday: 0 },
];

export const categories: MenuCategory[] = [
  {
    "id": "c_breakfast",
    "name": "Breakfast",
    "itemCount": 9
  },
  {
    "id": "c_coffee",
    "name": "Coffee",
    "itemCount": 2
  },
  {
    "id": "c_dessert",
    "name": "Dessert",
    "itemCount": 5
  },
  {
    "id": "c_maggi",
    "name": "Maggi",
    "itemCount": 5
  },
  {
    "id": "c_main_course",
    "name": "Main Course",
    "itemCount": 24
  },
  {
    "id": "c_mocktails",
    "name": "Mocktails",
    "itemCount": 7
  },
  {
    "id": "c_momos",
    "name": "Momos",
    "itemCount": 4
  },
  {
    "id": "c_pasta",
    "name": "Pasta",
    "itemCount": 3
  },
  {
    "id": "c_pizza",
    "name": "Pizza",
    "itemCount": 6
  },
  {
    "id": "c_rice",
    "name": "Rice",
    "itemCount": 4
  },
  {
    "id": "c_rotis_bread",
    "name": "Rotis & Bread",
    "itemCount": 9
  },
  {
    "id": "c_salads_raita",
    "name": "Salads & Raita",
    "itemCount": 6
  },
  {
    "id": "c_sandwiches",
    "name": "Sandwiches",
    "itemCount": 10
  },
  {
    "id": "c_shakes",
    "name": "Shakes",
    "itemCount": 4
  },
  {
    "id": "c_soup",
    "name": "Soup",
    "itemCount": 3
  },
  {
    "id": "c_starters",
    "name": "Starters",
    "itemCount": 20
  },
  {
    "id": "c_thali",
    "name": "thali",
    "itemCount": 2
  }
];

export const menuItems: MenuItem[] = [
  {
    "id": "m_aloo_paratha_with_curd",
    "name": "Aloo Paratha with Curd",
    "categoryId": "c_breakfast",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Premium quality Aloo Paratha with Curd made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1F5Z_4asQl2q9X0eh4rqq8PTrN6Nu8nAU&sz=w500"
  },
  {
    "id": "m_aloo_pyaz_paratha_with_curd",
    "name": "Aloo Pyaz Paratha with Curd",
    "categoryId": "c_breakfast",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Aloo Pyaz Paratha with Curd for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1a1CeZUscG-k8L-BJhDX-WVWJEBYbqFpu&sz=w500"
  },
  {
    "id": "m_butter_toast_with_jam",
    "name": "Butter Toast with Jam",
    "categoryId": "c_breakfast",
    "price": 100,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Butter Toast with Jam cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1vYL9hScC7E6j2Jo4BJMS-ST-raAdecDH&sz=w500"
  },
  {
    "id": "m_chole_bhature",
    "name": "Chole Bhature",
    "categoryId": "c_breakfast",
    "price": 100,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Chole Bhature cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1RZdkP2-H7BDf5xiTzbJ1iLPmRzPHWJZY&sz=w500"
  },
  {
    "id": "m_gobhi_paratha_with_curd",
    "name": "Gobhi Paratha with Curd",
    "categoryId": "c_breakfast",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Gobhi Paratha with Curd for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1Ny3CaN4i4pGtmi7pQIWmTozsMFdQViPN&sz=w500"
  },
  {
    "id": "m_paneer_paratha_with_curd",
    "name": "Paneer Paratha with Curd",
    "categoryId": "c_breakfast",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Paneer Paratha with Curd served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1nqMKdh2_iD7FlhGEutkSJJpa7Nr9AeWi&sz=w500"
  },
  {
    "id": "m_poha",
    "name": "Poha",
    "categoryId": "c_breakfast",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Poha served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1Ucgus62_4nuQypzzZue15Gi_0yRMihlk&sz=w500"
  },
  {
    "id": "m_poori_bhaji",
    "name": "Poori Bhaji",
    "categoryId": "c_breakfast",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Poori Bhaji for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=12iNtpC1AcNwCfJwPRCfWXCOBvg-0g1c0&sz=w500"
  },
  {
    "id": "m_upma",
    "name": "Upma",
    "categoryId": "c_breakfast",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Upma served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1XW5MFMfBqd6g3L_OrL1OUCSmfTdhK4SP&sz=w500"
  },
  {
    "id": "m_cold_coffee_with_ice_cream_choco_chips",
    "name": "Cold Coffee with Ice Cream (Choco Chips)",
    "categoryId": "c_coffee",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Cold Coffee with Ice Cream (Choco Chips) served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1xmsI0pu2IezgzpViqDtQHO5w1ir1x1eG&sz=w500"
  },
  {
    "id": "m_cold_coffee",
    "name": "Cold Coffee",
    "categoryId": "c_coffee",
    "price": 160,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Cold Coffee for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=15LlzcmnQ11iZTJ1ofzs-w7rUCxotM21j&sz=w500"
  },
  {
    "id": "m_butterscotch_ice_cream",
    "name": "Butterscotch Ice Cream",
    "categoryId": "c_dessert",
    "price": 150,
    "veg": true,
    "available": true,
    "description": "Premium quality Butterscotch Ice Cream made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1jxnewjgT0N9zF1ZEdEN1g9miZ3kTWuPw&sz=w500"
  },
  {
    "id": "m_chocolate_ice_cream",
    "name": "Chocolate Ice Cream",
    "categoryId": "c_dessert",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Chocolate Ice Cream for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1uBl_HI-2zErW0q-YIKvpTmktYMh8n2WB&sz=w500"
  },
  {
    "id": "m_gulab_jamun",
    "name": "Gulab Jamun",
    "categoryId": "c_dessert",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Gulab Jamun for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=15nzXFJuuyriQO9vycgZ8i9t7KqCrRsGh&sz=w500"
  },
  {
    "id": "m_strawberry_ice_cream",
    "name": "Strawberry Ice Cream",
    "categoryId": "c_dessert",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Strawberry Ice Cream served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1_Pg36TvW_Z3_B-hBcL4hEUt8_cAZBbf-&sz=w500"
  },
  {
    "id": "m_vanilla_ice_cream",
    "name": "Vanilla Ice Cream",
    "categoryId": "c_dessert",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Vanilla Ice Cream cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1CUV4eaTuI21z1GxezLV7z6xe_3C8raxH&sz=w500"
  },
  {
    "id": "m_cheese_maggi",
    "name": "Cheese Maggi",
    "categoryId": "c_maggi",
    "price": 60,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Cheese Maggi served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1YSKjNGUUAtrX3TkPhkRXdFcI14dWiYLI&sz=w500"
  },
  {
    "id": "m_masala_maggi",
    "name": "Masala Maggi",
    "categoryId": "c_maggi",
    "price": 60,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Masala Maggi served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1rb51YFPlDs_jxwEMTAD9koxZX_A4nmeP&sz=w500"
  },
  {
    "id": "m_peri_peri_maggi",
    "name": "Peri Peri Maggi",
    "categoryId": "c_maggi",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Peri Peri Maggi for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1Q2ePs0T4k5gbungFO9IRkS5OSNFe9D-F&sz=w500"
  },
  {
    "id": "m_plain_maggi",
    "name": "Plain Maggi",
    "categoryId": "c_maggi",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Plain Maggi for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1PEU9gGMM6-IhKwq50r-e88TaFl1t9WbB&sz=w500"
  },
  {
    "id": "m_veg_maggi",
    "name": "Veg Maggi",
    "categoryId": "c_maggi",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Veg Maggi cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=13QDw3SLjm8VZSW3XA78k8uZFr9knBHSN&sz=w500"
  },
  {
    "id": "m_aloo_gobi",
    "name": "Aloo Gobi",
    "categoryId": "c_main_course",
    "price": 310,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Aloo Gobi cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1QP4GXnIsb3_n9lPXCkiRUcK2FG5MOloA&sz=w500"
  },
  {
    "id": "m_aloo_matar",
    "name": "Aloo Matar",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Premium quality Aloo Matar made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1gvCHB8-rlFl-qmOqiOA3B3B5tu-2eUDX&sz=w500"
  },
  {
    "id": "m_bhindi_masala",
    "name": "Bhindi Masala",
    "categoryId": "c_main_course",
    "price": 280,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Bhindi Masala cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1kuIW3CtpjDwh314wz5IwS4GauvUKxCgi&sz=w500"
  },
  {
    "id": "m_chana_masala",
    "name": "Chana Masala",
    "categoryId": "c_main_course",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Chana Masala served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1HM9U5VlG_rtOrIl4U--XuQs69yYm0keG&sz=w500"
  },
  {
    "id": "m_dal_fry",
    "name": "Dal Fry",
    "categoryId": "c_main_course",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Dal Fry for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1vu0IHPNEQi786OLUzehD31_5eRGFnyx-&sz=w500"
  },
  {
    "id": "m_dal_khichdi",
    "name": "Dal Khichdi",
    "categoryId": "c_main_course",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Dal Khichdi for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1sG0oYzDI-OFPZvZ45qhfClnPDElZ3RO2&sz=w500"
  },
  {
    "id": "m_dal_makhani",
    "name": "Dal Makhani",
    "categoryId": "c_main_course",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Dal Makhani for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1g-EzzIMspn93RPm2njZzipN8TM_wnBNI&sz=w500"
  },
  {
    "id": "m_dal_tadka",
    "name": "Dal Tadka",
    "categoryId": "c_main_course",
    "price": 310,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Dal Tadka cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1cQMq8BCzQXe5Yc84c1gb9674ECLXcmj0&sz=w500"
  },
  {
    "id": "m_dum_aloo",
    "name": "Dum Aloo",
    "categoryId": "c_main_course",
    "price": 280,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Dum Aloo served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=18yyBfdq3MGghlEweC-4abxYcOMPR_fNA&sz=w500"
  },
  {
    "id": "m_handi_dal",
    "name": "Handi Dal",
    "categoryId": "c_main_course",
    "price": 310,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Handi Dal cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1ImYdHj7fHzkCflyqwYEIgnU0ViHSkh5h&sz=w500"
  },
  {
    "id": "m_handi_paneer",
    "name": "Handi Paneer",
    "categoryId": "c_main_course",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Handi Paneer served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1zffjzbd3ZjLQ94B60CJdBUGTD7Os2Fe4&sz=w500"
  },
  {
    "id": "m_jeera_aloo",
    "name": "Jeera Aloo",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Premium quality Jeera Aloo made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1rNwDSQqakallm0rC49c40mz9Mx5PQXwo&sz=w500"
  },
  {
    "id": "m_kadai_paneer",
    "name": "Kadai Paneer",
    "categoryId": "c_main_course",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Kadai Paneer served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1ffKca_0v3NQGlw4G-6-0biut6TVRivmi&sz=w500"
  },
  {
    "id": "m_kaju_curry",
    "name": "Kaju Curry",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Premium quality Kaju Curry made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1A1_VG4VARwuTlKJ8iq9bTsxn1i7kS_kk&sz=w500"
  },
  {
    "id": "m_malai_kofta",
    "name": "Malai Kofta",
    "categoryId": "c_main_course",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Malai Kofta for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1QiMMdy4HLcA1hxkXFybVVJqz-_bhbBmU&sz=w500"
  },
  {
    "id": "m_matar_paneer",
    "name": "Matar Paneer",
    "categoryId": "c_main_course",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Matar Paneer served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1jUUzOLrJ_14KaYRCaslGQfYBIV8N6Y2M&sz=w500"
  },
  {
    "id": "m_mix_veg_7_blue_hills_special",
    "name": "Mix Veg (7 Blue Hills Special)",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Premium quality Mix Veg (7 Blue Hills Special) made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1OSpDxJU7aBqsd-RWFjEL4-CKS5S33bDq&sz=w500"
  },
  {
    "id": "m_mushroom_masala",
    "name": "Mushroom Masala",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Mushroom Masala for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1DltwsRNQ8k5iVvzIgEy3dGXUa8sPX0K0&sz=w500"
  },
  {
    "id": "m_palak_paneer",
    "name": "Palak Paneer",
    "categoryId": "c_main_course",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Palak Paneer served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1QB16u003KBHdYgeuOZT62PL3fkGPkMk_&sz=w500"
  },
  {
    "id": "m_paneer_bhurji",
    "name": "Paneer Bhurji",
    "categoryId": "c_main_course",
    "price": 280,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Paneer Bhurji cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1_PuJ6Gqr1rChYI56o_AViOdtIo51vXl_&sz=w500"
  },
  {
    "id": "m_paneer_butter_masala",
    "name": "Paneer Butter Masala",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Paneer Butter Masala served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1PXPStYQethlyiwmIDEOnJL__hhSSLInE&sz=w500"
  },
  {
    "id": "m_paneer_lababdar",
    "name": "Paneer Lababdar",
    "categoryId": "c_main_course",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Paneer Lababdar for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1fXc-CUXl2zEIC4IF_udg9sQ6slguzi4F&sz=w500"
  },
  {
    "id": "m_sev_bhaji",
    "name": "Sev Bhaji",
    "categoryId": "c_main_course",
    "price": 310,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Sev Bhaji cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1h8VXUs23f5LdElABHEueZ2WyT8SXUE9v&sz=w500"
  },
  {
    "id": "m_sev_tamatar",
    "name": "Sev Tamatar",
    "categoryId": "c_main_course",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Sev Tamatar for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1MhMYTAlHn2oMCcCGG_BUH9Otk0HO1DxH&sz=w500"
  },
  {
    "id": "m_black_currant_mocktail",
    "name": "Black Currant Mocktail",
    "categoryId": "c_mocktails",
    "price": 150,
    "veg": true,
    "available": true,
    "description": "Premium quality Black Currant Mocktail made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1i8pJu68VZ5HkpuvRa5GulblDfoDeIkEC&sz=w500"
  },
  {
    "id": "m_blue_lagoon",
    "name": "Blue Lagoon",
    "categoryId": "c_mocktails",
    "price": 160,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Blue Lagoon for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1a9YO4cESsRue8Zh9ZKq5_eStuu7YtjUH&sz=w500"
  },
  {
    "id": "m_blueberry_mocktail",
    "name": "Blueberry Mocktail",
    "categoryId": "c_mocktails",
    "price": 150,
    "veg": true,
    "available": true,
    "description": "Premium quality Blueberry Mocktail made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1RHsUVc1doz8onThGzT3za0Y176R_7J40&sz=w500"
  },
  {
    "id": "m_green_apple_mocktail",
    "name": "Green Apple Mocktail",
    "categoryId": "c_mocktails",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Green Apple Mocktail served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1umPbVgC-M4y2M8NSl5PftmwWIQKnSphO&sz=w500"
  },
  {
    "id": "m_lemon_soda",
    "name": "Lemon Soda",
    "categoryId": "c_mocktails",
    "price": 150,
    "veg": true,
    "available": true,
    "description": "Premium quality Lemon Soda made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=11S1u9zQSrMk4uYqfOMXwi3FjuLWYm_a-&sz=w500"
  },
  {
    "id": "m_strawberry_mocktail",
    "name": "Strawberry Mocktail",
    "categoryId": "c_mocktails",
    "price": 160,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Strawberry Mocktail for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=11XZl_ctRsBFufYiqlV_wHc25_hMCmzqC&sz=w500"
  },
  {
    "id": "m_virgin_mojito",
    "name": "Virgin Mojito",
    "categoryId": "c_mocktails",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Virgin Mojito cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1y13FYFdgG2PI75wYHxHRHsode6XqxBqK&sz=w500"
  },
  {
    "id": "m_cheesy_kurkure_momos",
    "name": "Cheesy Kurkure Momos",
    "categoryId": "c_momos",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Cheesy Kurkure Momos served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1xEp6d_KW5fMJB8QOnkvSz8VN4AhStdzV&sz=w500"
  },
  {
    "id": "m_chilli_fried_momos",
    "name": "Chilli Fried Momos",
    "categoryId": "c_momos",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Premium quality Chilli Fried Momos made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1X0595biXqp8YXhgL_xUshoHT4IEaRcsE&sz=w500"
  },
  {
    "id": "m_fried_momos",
    "name": "Fried Momos",
    "categoryId": "c_momos",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Fried Momos for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=17AaQsVWga3CXvSiIS0jSdzLyv9lQ-8wM&sz=w500"
  },
  {
    "id": "m_steamed_momos",
    "name": "Steamed Momos",
    "categoryId": "c_momos",
    "price": 110,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Steamed Momos cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1qmvpayXPTqw9xvIRST9RPbfVp8v9hqHd&sz=w500"
  },
  {
    "id": "m_alfredo_pasta",
    "name": "Alfredo Pasta",
    "categoryId": "c_pasta",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Alfredo Pasta cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1eGeku3gRvtGTOQCfsMD6pRHn8mdm9YoI&sz=w500"
  },
  {
    "id": "m_arrabbiata_pasta",
    "name": "Arrabbiata Pasta",
    "categoryId": "c_pasta",
    "price": 160,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Arrabbiata Pasta served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1-qg_uOaSTriMH9x3vj8Oy3JQmz74uKb5&sz=w500"
  },
  {
    "id": "m_pink_sauce_pasta",
    "name": "Pink Sauce Pasta",
    "categoryId": "c_pasta",
    "price": 160,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Pink Sauce Pasta served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1A_HggkrDHqMzCjLuHfhyLFgBBue4PNls&sz=w500"
  },
  {
    "id": "m_cheese_margherita_pizza",
    "name": "Cheese Margherita Pizza",
    "categoryId": "c_pizza",
    "price": 320,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Cheese Margherita Pizza for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=18FXrHbkovVxRDW6Gm1xwnQQq6JCFlzXC&sz=w500"
  },
  {
    "id": "m_cheesy_corn_pizza",
    "name": "Cheesy Corn Pizza",
    "categoryId": "c_pizza",
    "price": 290,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Cheesy Corn Pizza cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1bcZe_2y4vuunWG_v5IaSg-CDTV3pVkLW&sz=w500"
  },
  {
    "id": "m_farm_house_pizza",
    "name": "Farm House Pizza",
    "categoryId": "c_pizza",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Farm House Pizza served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1VBIYe0i3Z2SZFlxcLhWVI4m_K3Hs1YLB&sz=w500"
  },
  {
    "id": "m_loaded_veg_pizza",
    "name": "Loaded Veg Pizza",
    "categoryId": "c_pizza",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Loaded Veg Pizza served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1ZJ4rLS2aLz-aZkDY3HZs6Lcngt2hRQh5&sz=w500"
  },
  {
    "id": "m_margherita_pizza",
    "name": "Margherita Pizza",
    "categoryId": "c_pizza",
    "price": 240,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Margherita Pizza served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1C6QlOLTH59iJis2ANHMn94rs6tdTUgyJ&sz=w500"
  },
  {
    "id": "m_paneer_tikka_pizza",
    "name": "Paneer Tikka Pizza",
    "categoryId": "c_pizza",
    "price": 320,
    "veg": true,
    "available": true,
    "description": "Premium quality Paneer Tikka Pizza made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1cV0WfjICYeXOh_Rvs3qYKZKIpvqUcSG7&sz=w500"
  },
  {
    "id": "m_jeera_rice",
    "name": "Jeera Rice",
    "categoryId": "c_rice",
    "price": 155,
    "veg": true,
    "available": true,
    "description": "Premium quality Jeera Rice made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1LjhownUuIwnFtfmNAUf6d9m8UdeU1Wm5&sz=w500"
  },
  {
    "id": "m_steam_rice",
    "name": "Steam Rice",
    "categoryId": "c_rice",
    "price": 155,
    "veg": true,
    "available": true,
    "description": "Premium quality Steam Rice made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1IHm2pwMOu5YBjxUuA-8MtjErCnZYsfMz&sz=w500"
  },
  {
    "id": "m_veg_biryani",
    "name": "Veg Biryani",
    "categoryId": "c_rice",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Veg Biryani for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1oE7dyHjSmoyyN8-B8zLblB3_NUuoFM5W&sz=w500"
  },
  {
    "id": "m_veg_pulao",
    "name": "Veg Pulao",
    "categoryId": "c_rice",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Veg Pulao cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1ZH8n37hO8xJcOO1WuLyHc-CuiQPeZ1qU&sz=w500"
  },
  {
    "id": "m_butter_naan",
    "name": "Butter Naan",
    "categoryId": "c_rotis_bread",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Butter Naan for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1aFAKTJ7Dq9ceTtcHn1ZiOmxu51tP9_1m&sz=w500"
  },
  {
    "id": "m_butter_tandoori_roti",
    "name": "Butter Tandoori Roti",
    "categoryId": "c_rotis_bread",
    "price": 25,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Butter Tandoori Roti served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=194I27edPYr-_RvvZg0UwixdlA5FmyRpT&sz=w500"
  },
  {
    "id": "m_butter_tawa_roti",
    "name": "Butter Tawa Roti",
    "categoryId": "c_rotis_bread",
    "price": 25,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Butter Tawa Roti served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=12mHkaP_ftJvc2IzAM7y36ceKN3aP1vFo&sz=w500"
  },
  {
    "id": "m_garlic_naan",
    "name": "Garlic Naan",
    "categoryId": "c_rotis_bread",
    "price": 80,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Garlic Naan for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1-fb0DpD2-NHiYa_DIGK-1DRD39TX3Xyb&sz=w500"
  },
  {
    "id": "m_lachha_paratha",
    "name": "Lachha Paratha",
    "categoryId": "c_rotis_bread",
    "price": 60,
    "veg": true,
    "available": true,
    "description": "Premium quality Lachha Paratha made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1S1wf-zXtQ9QSTga7lhPdmrAkzIquc9s1&sz=w500"
  },
  {
    "id": "m_missi_roti",
    "name": "Missi Roti",
    "categoryId": "c_rotis_bread",
    "price": 60,
    "veg": true,
    "available": true,
    "description": "Premium quality Missi Roti made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1LtNRc75ADiFYtgH9IgqdnLVIMv0HYwE9&sz=w500"
  },
  {
    "id": "m_naan",
    "name": "Naan",
    "categoryId": "c_rotis_bread",
    "price": 25,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Naan served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1wK2Akl_tGBrkhDZ3kdYk9uNJPilD9uCh&sz=w500"
  },
  {
    "id": "m_tandoori_roti",
    "name": "Tandoori Roti",
    "categoryId": "c_rotis_bread",
    "price": 45,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Tandoori Roti cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1qBWEHlUTZGnK8spN4TiQY6n-QadVxLuc&sz=w500"
  },
  {
    "id": "m_tawa_roti",
    "name": "Tawa Roti",
    "categoryId": "c_rotis_bread",
    "price": 45,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Tawa Roti cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1vZigR627lZotFz7b3BS9Ljrjs9EeCOws&sz=w500"
  },
  {
    "id": "m_boondi_raita",
    "name": "Boondi Raita",
    "categoryId": "c_salads_raita",
    "price": 60,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Boondi Raita served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1KEY28yQa0OoKrvCmINsm7DiucnAxuUn3&sz=w500"
  },
  {
    "id": "m_fruit_raita",
    "name": "Fruit Raita",
    "categoryId": "c_salads_raita",
    "price": 125,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Fruit Raita for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=17kLMxq0tPkNVqJDNbrn2iXIeMQFJ6D7w&sz=w500"
  },
  {
    "id": "m_green_salad",
    "name": "Green Salad",
    "categoryId": "c_salads_raita",
    "price": 125,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Green Salad for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1vR-_fxBYjy-dutT89-2M-Da6otIXzScf&sz=w500"
  },
  {
    "id": "m_mixed_veg_raita",
    "name": "Mixed Veg Raita",
    "categoryId": "c_salads_raita",
    "price": 125,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Mixed Veg Raita for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1SL3Cb0ezk5SlrppSaU811WvPlFO1VUpp&sz=w500"
  },
  {
    "id": "m_onion_salad",
    "name": "Onion Salad",
    "categoryId": "c_salads_raita",
    "price": 125,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Onion Salad for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1xdV-H9qMhD5yDAveGt_F1YfPGmZHNZAw&sz=w500"
  },
  {
    "id": "m_plain_curd",
    "name": "Plain Curd",
    "categoryId": "c_salads_raita",
    "price": 100,
    "veg": true,
    "available": true,
    "description": "Premium quality Plain Curd made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1vAVpy0Cr3Jh3SfvaLqigaGu2N4Vd71ik&sz=w500"
  },
  {
    "id": "m_aloo_cheesy_masala_burger",
    "name": "Aloo Cheesy Masala Burger",
    "categoryId": "c_sandwiches",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Aloo Cheesy Masala Burger cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1CWlGANQdXcL6kspD7UAMb-boiS30iucy&sz=w500"
  },
  {
    "id": "m_burger",
    "name": "Burger",
    "categoryId": "c_sandwiches",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Premium quality Burger made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=120G_Gmizb5O97Frg9gjgQNK0FiiiBhPN&sz=w500"
  },
  {
    "id": "m_cheese_grilled_sandwich",
    "name": "Cheese Grilled Sandwich",
    "categoryId": "c_sandwiches",
    "price": 165,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Cheese Grilled Sandwich for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1BV-SESJr5dgK_OQ0PUrGUsDpqd2Ud2YP&sz=w500"
  },
  {
    "id": "m_cheesy_corn_sandwich",
    "name": "Cheesy Corn Sandwich",
    "categoryId": "c_sandwiches",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Cheesy Corn Sandwich served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1_A3qXOlgGhLiDawWnWi_Y9oH-pkJM-Qs&sz=w500"
  },
  {
    "id": "m_garlic_bread_supreme",
    "name": "Garlic Bread Supreme",
    "categoryId": "c_sandwiches",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Garlic Bread Supreme served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1b9lFzV12RtQ8BY6mvw-uOYYr4_Dy3gdG&sz=w500"
  },
  {
    "id": "m_garlic_bread_with_cheese",
    "name": "Garlic Bread with Cheese",
    "categoryId": "c_sandwiches",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Garlic Bread with Cheese served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=11VqAgSvz2mIbfE9LrdB1Fi2SznXzJyyv&sz=w500"
  },
  {
    "id": "m_garlic_bread",
    "name": "Garlic Bread",
    "categoryId": "c_sandwiches",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Garlic Bread served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1P_p80e5APm3r9roBxoITZRnDeWgqQmZB&sz=w500"
  },
  {
    "id": "m_grilled_sandwich",
    "name": "Grilled Sandwich",
    "categoryId": "c_sandwiches",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Grilled Sandwich served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1gABbU03QCuRDV0-iSnuSugDNcTjq7clh&sz=w500"
  },
  {
    "id": "m_paneer_tikka_sandwich",
    "name": "Paneer Tikka Sandwich",
    "categoryId": "c_sandwiches",
    "price": 120,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Paneer Tikka Sandwich cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=13l7-z3wRqD0AIliuRmB-YM6Nq0Yc0BF5&sz=w500"
  },
  {
    "id": "m_veg_sandwich",
    "name": "Veg Sandwich",
    "categoryId": "c_sandwiches",
    "price": 90,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Veg Sandwich served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=156Yl8-TDq3sUDLv7meXGZivjdjBrGVMN&sz=w500"
  },
  {
    "id": "m_banana_shake",
    "name": "Banana Shake",
    "categoryId": "c_shakes",
    "price": 110,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Banana Shake served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1xkQpXxP7Qt_FVICWlYgchuAyuNuZCcJ2&sz=w500"
  },
  {
    "id": "m_butter_scotch_shake",
    "name": "Butter Scotch Shake",
    "categoryId": "c_shakes",
    "price": 165,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Butter Scotch Shake for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1A1XyRx1AneurMfWBOagYfxDpEejRHA94&sz=w500"
  },
  {
    "id": "m_mango_shake",
    "name": "Mango Shake",
    "categoryId": "c_shakes",
    "price": 165,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Mango Shake for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1pqLaF_PRA8z8ku59-B0MFeBVA1HcnL9o&sz=w500"
  },
  {
    "id": "m_strawberry_shake",
    "name": "Strawberry Shake",
    "categoryId": "c_shakes",
    "price": 110,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Strawberry Shake served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1Qaz14ADFX1HpHfgkVTtAqPp65qgnNaWD&sz=w500"
  },
  {
    "id": "m_hot_sour_soup",
    "name": "Hot & Sour Soup",
    "categoryId": "c_soup",
    "price": 130,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Hot & Sour Soup for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1P9Ekhs_O6gKcQLtpIqH2A7QNpPsDbgUe&sz=w500"
  },
  {
    "id": "m_sweet_corn_soup",
    "name": "Sweet Corn Soup",
    "categoryId": "c_soup",
    "price": 130,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Sweet Corn Soup for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1QUxnVH4tNIcTS3INF-wAhSclIz1veYXb&sz=w500"
  },
  {
    "id": "m_tomato_soup",
    "name": "Tomato Soup",
    "categoryId": "c_soup",
    "price": 130,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Tomato Soup for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1IT7if9-mwE7jmxKxYiQexZwlYPXcUIp6&sz=w500"
  },
  {
    "id": "m_cheese_pocket",
    "name": "Cheese Pocket",
    "categoryId": "c_starters",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Cheese Pocket cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1UrfU900AfFgI2FDE9e4pv7ZqUcLPO_hC&sz=w500"
  },
  {
    "id": "m_chilli_paneer",
    "name": "Chilli Paneer",
    "categoryId": "c_starters",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Chilli Paneer cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1-XGM99DucMsuw39VvY_3AV8Gp6A0tec2&sz=w500"
  },
  {
    "id": "m_chinese_bhel",
    "name": "Chinese Bhel",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Chinese Bhel served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1wMlFqKQw_dI3JbW4UC5X11FnEUQ45b-C&sz=w500"
  },
  {
    "id": "m_crispy_corn",
    "name": "Crispy Corn",
    "categoryId": "c_starters",
    "price": 245,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Crispy Corn for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1I1Ne83lbGdVYW4EhB-mP9w-Yl3lPtpsc&sz=w500"
  },
  {
    "id": "m_french_fries",
    "name": "French Fries",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared French Fries served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1rSr1HHJeBS6A9fWeQsbPEhjpz7aSFuhw&sz=w500"
  },
  {
    "id": "m_hakka_noodles",
    "name": "Hakka Noodles",
    "categoryId": "c_starters",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Hakka Noodles cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=13etl3x-ujOoG5GIgHU-nJec-EAWfXbqH&sz=w500"
  },
  {
    "id": "m_hara_bhara_kabab",
    "name": "Hara Bhara Kabab",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Hara Bhara Kabab served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1m3m8J0CoYKfq0X3Dwg0phkFKFcyTwlPH&sz=w500"
  },
  {
    "id": "m_honey_chilli_potato",
    "name": "Honey Chilli Potato",
    "categoryId": "c_starters",
    "price": 245,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Honey Chilli Potato for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1K8Vii0jAY5fgr_unLOYRYbzuIVt45fky&sz=w500"
  },
  {
    "id": "m_masala_papad",
    "name": "Masala Papad",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Masala Papad served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1gEjS5q0mCHr7xeWCE-FIMMlHAjAbw9ZI&sz=w500"
  },
  {
    "id": "m_mix_veg_pakoda",
    "name": "Mix Veg Pakoda",
    "categoryId": "c_starters",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Premium quality Mix Veg Pakoda made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=16XmkCwxUGenKVO4b65to3BUKgxzDQkd-&sz=w500"
  },
  {
    "id": "m_paneer_65",
    "name": "Paneer 65",
    "categoryId": "c_starters",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Paneer 65 cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1uYurtqLpEFdKAcDUn42yrFoevdhePD8G&sz=w500"
  },
  {
    "id": "m_paneer_pakoda",
    "name": "Paneer Pakoda",
    "categoryId": "c_starters",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Paneer Pakoda cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1gGGZhr-cGw5SZSoiU7UiSpRPrVbeuCtg&sz=w500"
  },
  {
    "id": "m_paneer_tikka",
    "name": "Paneer Tikka",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Paneer Tikka served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1R621eTmJLzdeTG0NSftlvM7aSw3CwTZq&sz=w500"
  },
  {
    "id": "m_peri_peri_fries",
    "name": "Peri Peri Fries",
    "categoryId": "c_starters",
    "price": 245,
    "veg": true,
    "available": true,
    "description": "Chef special recipe of traditional Peri Peri Fries for a perfect meal.",
    "image": "https://drive.google.com/thumbnail?id=1fbu2kHzrz2ngBMLmqYozOTHmF7x_Zcdc&sz=w500"
  },
  {
    "id": "m_schezwan_noodles",
    "name": "Schezwan Noodles",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Schezwan Noodles served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1KOnRrtbeecfiaWFKi2t8oHbPPkWiNEY6&sz=w500"
  },
  {
    "id": "m_spring_rolls",
    "name": "Spring Rolls",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Spring Rolls served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1D3C2-_tv7B4iFoFvTP2SqLYrDPhRiiSp&sz=w500"
  },
  {
    "id": "m_veg_cheese_balls",
    "name": "Veg Cheese Balls",
    "categoryId": "c_starters",
    "price": 140,
    "veg": true,
    "available": true,
    "description": "Freshly prepared Veg Cheese Balls served with classic sides.",
    "image": "https://drive.google.com/thumbnail?id=1DkYhImMPLnennkjQHUfcyVBIHSvddB2l&sz=w500"
  },
  {
    "id": "m_veg_hakka_noodles",
    "name": "Veg Hakka Noodles",
    "categoryId": "c_starters",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Veg Hakka Noodles cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=184T5VmeEEDmQHeB78RaOTLO-nY2m9bJK&sz=w500"
  },
  {
    "id": "m_veg_manchurian",
    "name": "Veg Manchurian",
    "categoryId": "c_starters",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Premium quality Veg Manchurian made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=1JgY7IpFiUbM4yNPKUuLJeZqoWw3SJQa1&sz=w500"
  },
  {
    "id": "m_veg_pakoda",
    "name": "Veg Pakoda",
    "categoryId": "c_starters",
    "price": 220,
    "veg": true,
    "available": true,
    "description": "Premium quality Veg Pakoda made with fresh ingredients.",
    "image": "https://drive.google.com/thumbnail?id=190MkPRYRRyHI5eWx5Xw5bgRXzrpo0lwn&sz=w500"
  },
  {
    "id": "m_regular_thali",
    "name": "Regular Thali",
    "categoryId": "c_thali",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Regular Thali cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1uR-VGMBe3cpQfZDu1U4pH5tKnYzRQcSh&sz=w500"
  },
  {
    "id": "m_special_thali",
    "name": "Special Thali",
    "categoryId": "c_thali",
    "price": 180,
    "veg": true,
    "available": true,
    "description": "Delicious homemade style Special Thali cooked to perfection.",
    "image": "https://drive.google.com/thumbnail?id=1wU6giroO9ut1zw_MWmOTf-oo6wZvjfkB&sz=w500"
  }
];

const now = Date.now();
const iso = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();

export const orders: Order[] = [
  {
    id: "ORD-1042",
    sourceType: "room",
    sourceLabel: "Room 204",
    items: [
      { id: "m_paneer_butter_masala", name: "Paneer Butter Masala", qty: 1, price: 310, veg: true },
      { id: "m_butter_naan", name: "Butter Naan", qty: 3, price: 60, veg: true },
    ],
    instructions: "Less spicy please",
    status: "pending",
    placedAt: iso(4),
    updatedAt: iso(4),
    total: 490,
  },
  {
    id: "ORD-1041",
    sourceType: "table",
    sourceLabel: "Table T4",
    items: [
      { id: "m_paneer_tikka", name: "Paneer Tikka", qty: 2, price: 240, veg: true },
      { id: "m_cold_coffee", name: "Cold Coffee", qty: 4, price: 80, veg: true },
    ],
    status: "preparing",
    placedAt: iso(12),
    updatedAt: iso(6),
    total: 800,
  },
  {
    id: "ORD-1040",
    sourceType: "table",
    sourceLabel: "Table T1",
    items: [
      { id: "m_veg_manchurian", name: "Veg Manchurian", qty: 1, price: 220, veg: true },
    ],
    status: "ready",
    placedAt: iso(22),
    updatedAt: iso(3),
    total: 220,
  },
  {
    id: "ORD-1039",
    sourceType: "room",
    sourceLabel: "Room 101",
    items: [
      { id: "m_dal_makhani", name: "Dal Makhani", qty: 1, price: 260, veg: true },
      { id: "m_butter_naan", name: "Butter Naan", qty: 2, price: 60, veg: true },
      { id: "m_gulab_jamun", name: "Gulab Jamun", qty: 2, price: 120, veg: true },
    ],
    status: "delivered",
    placedAt: iso(70),
    updatedAt: iso(40),
    total: 620,
  },
  {
    id: "ORD-1038",
    sourceType: "room",
    sourceLabel: "Room 301",
    items: [
      { id: "m_cold_coffee", name: "Cold Coffee", qty: 2, price: 80, veg: true },
    ],
    status: "delivered",
    placedAt: iso(130),
    updatedAt: iso(110),
    total: 160,
  },
  {
    id: "ORD-1037",
    sourceType: "table",
    sourceLabel: "Table T5",
    items: [
      { id: "m_paneer_butter_masala", name: "Paneer Butter Masala", qty: 1, price: 310, veg: true },
      { id: "m_butter_naan", name: "Butter Naan", qty: 2, price: 60, veg: true },
    ],
    status: "preparing",
    placedAt: iso(9),
    updatedAt: iso(2),
    total: 430,
  },
];

export const staff: StaffUser[] = [
  { id: "u1", name: "Vikram Singh", role: "admin", email: "vikram@hotel.com", status: "active" },
  { id: "u2", name: "Priya Sharma", role: "manager", email: "priya@hotel.com", status: "active" },
  { id: "u3", name: "Ramesh Kumar", role: "kitchen", email: "ramesh@hotel.com", status: "active" },
  { id: "u4", name: "Sunita Devi", role: "waiter", email: "sunita@hotel.com", status: "active" },
  { id: "u5", name: "Arjun Rathore", role: "waiter", email: "arjun@hotel.com", status: "inactive" },
];

export const weeklySales: SalesPoint[] = [
  { label: "Mon", revenue: 18400, orders: 42 },
  { label: "Tue", revenue: 21200, orders: 48 },
  { label: "Wed", revenue: 16800, orders: 39 },
  { label: "Thu", revenue: 23600, orders: 55 },
  { label: "Fri", revenue: 29200, orders: 63 },
  { label: "Sat", revenue: 34500, orders: 78 },
  { label: "Sun", revenue: 31100, orders: 71 },
];

export const topItems = [
  { name: "Paneer Butter Masala", unitsSold: 142, revenue: 44020 },
  { name: "Paneer Tikka", unitsSold: 118, revenue: 28320 },
  { name: "Tawa Naan", unitsSold: 310, revenue: 18600 },
  { name: "Masala Chai", unitsSold: 205, revenue: 16400 },
  { name: "Dal Makhani", unitsSold: 96, revenue: 24960 },
];
