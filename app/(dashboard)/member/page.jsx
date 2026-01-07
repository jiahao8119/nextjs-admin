"use client";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  PenSquare,
  LayoutGrid,
  Trash,
  Plus,
  Download,
  ChevronDown,
  X,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "../../../components/ui/DeletePopUp";
// import { CSVLink } from "react-csv";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MemberPage = () => {
const router = useRouter();

  const dummyTiers = [
    { id: 1, name: "Gold" },
    { id: 2, name: "Silver" },
    { id: 3, name: "Bronze" },
  ];

  const dummyMembers = [
    {
      id: 1,
      name: "Dustin Cornwell",
      phone: "012-3456789",
      email: "courtney.henry@example.com",
      customer_tier: "Gold",
      customer_wallet: 250.5,
      total_order: 18,
      total_order_spend: 3240.75,
      active_voucher: 2,
      used_voucher: 6,
      latest_order_date: "2024-10-04",
      created_at: "2023-03-12",
      customer_referral_code: "REF12345",
    },
    {
      id: 2,
      name: "Darlene Robertson",
      phone: "019-2223344",
      email: "darlene.robertson@example.com",
      customer_tier: "Silver",
      customer_wallet: 120.0,
      total_order: 9,
      total_order_spend: 980.0,
      active_voucher: 1,
      used_voucher: 3,
      latest_order_date: "2024-09-22",
      created_at: "2022-11-05",
      customer_referral_code: "REF77889",
    },
    {
      id: 3,
      name: "Guy Hawkins",
      phone: "018-7766554",
      email: "guy.hawkins@example.com",
      customer_tier: "Bronze",
      customer_wallet: 75.25,
      total_order: 5,
      total_order_spend: 410.5,
      active_voucher: 0,
      used_voucher: 1,
      latest_order_date: "2024-08-10",
      created_at: "2023-07-18",
      customer_referral_code: "REF44662",
    },
    {
      id: 4,
      name: "Devon Lane",
      phone: "017-8899001",
      email: "devon.lane@example.com",
      customer_tier: "Gold",
      customer_wallet: 540.0,
      total_order: 24,
      total_order_spend: 4820.3,
      active_voucher: 4,
      used_voucher: 9,
      latest_order_date: "2024-11-02",
      created_at: "2021-12-01",
      customer_referral_code: "REF99881",
    },
    {
      id: 5,
      name: "Jane Cooper",
      phone: "016-1112233",
      email: "jane.cooper@example.com",
      customer_tier: "Silver",
      customer_wallet: 310.75,
      total_order: 12,
      total_order_spend: 1750.0,
      active_voucher: 1,
      used_voucher: 4,
      latest_order_date: "2024-10-28",
      created_at: "2023-05-09",
      customer_referral_code: "REF56321",
    },
  ];

   const customStyles = {
    headRow: {
        style: {
        backgroundColor: "#312e81",
        color: "white",
        minHeight: "50px",
        fontSize: "16px",
        justifyContent: "center",
        },
    },
    headCells: {
        style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        fontWeight: "500",
        justifyContent: "center",
        textAlign: "center",
        },
    },
    rows: {
        style: {
        minHeight: "60px",
        fontSize: "15px",
        "&:hover": {
            backgroundColor: "#f9fafb",
        },
        justifyContent: "center",
        center: true,
        },
    },
    cells: {
        style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        center: true,
        },
    },
    pagination: {
        style: {
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        borderTopColor: "#e5e7eb",
        },
    },
    };

  const [customerData, setCustomerData] = useState([]);
  const [filteredCustomerData, setFilteredCustomerData] = useState([]);
  const [tierData, setTierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasCreatePermission] = useState(true);
  const [hasUpdatePermission] = useState(true);
  const [hasDeletePermission] = useState(true);
  const [isAdmin] = useState(true);

  // Filter states
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [referralFilter, setReferralFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // pagination-like placeholders
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRows, setTotalRows] = useState(0);

  const exportToCSV = () => {
    if (isDisabled) return;
    setIsDisabled(true);
    toast.info("Exporting dummy data to CSV...");
    setTimeout(() => {
      toast.success("Dummy export completed.");
      setIsDisabled(false);
    }, 600);
  };

  const applyFilters = () => {
    let filteredData = [...customerData];

    if (nameFilter) {
      filteredData = filteredData.filter(
        (customer) =>
          customer.name &&
          customer.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (emailFilter) {
      filteredData = filteredData.filter(
        (customer) =>
          customer.email &&
          customer.email.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    if (phoneFilter) {
      filteredData = filteredData.filter(
        (customer) => customer.phone && customer.phone.includes(phoneFilter)
      );
    }

    if (tierFilter) {
      filteredData = filteredData.filter(
        (customer) =>
          customer.customer_tier &&
          customer.customer_tier.toLowerCase() === tierFilter.toLowerCase()
      );
    }

    if (referralFilter) {
      filteredData = filteredData.filter(
        (customer) =>
          customer.customer_referral_code &&
          customer.customer_referral_code
            .toLowerCase()
            .includes(referralFilter.toLowerCase())
      );
    }

    setFilteredCustomerData(filteredData);
    setTotalRows(filteredData.length);
  };

  useEffect(() => {
  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to fetch members");

      const payload = await res.json();
      const items = payload?.data ?? [];

      setCustomerData(items);
      setFilteredCustomerData(items);
      setTotalRows(items.length);

    } catch (err) {
      console.error("API fetch failed, using dummy data:", err);
      setCustomerData(dummyMembers);
      setFilteredCustomerData(dummyMembers);
      setTotalRows(dummyMembers.length);

    } finally {
      setTierData(dummyTiers);
      setLoading(false);
    }
  };

  fetchMembers();
}, []);


  useEffect(() => {
    applyFilters();
  }, [nameFilter, emailFilter, phoneFilter, tierFilter, referralFilter, customerData]);

  const clearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setPhoneFilter("");
    setTierFilter("");
    setReferralFilter("");
    setFilteredCustomerData(customerData);
    setTotalRows(customerData.length);
  };

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tierColorClasses = {
    gold: "text-yellow-600 font-medium",
    silver: "text-gray-500 font-medium",
    bronze: "text-amber-700 font-medium",
    platinum: "text-purple-600 font-medium",
  };

  const getTierColor = (tier) => {
    const key = tier?.toLowerCase();
    return key ? tierColorClasses[key] : "";
  };

  const csvData = [
    [
      "Name",
      "Email",
      "Phone",
      "Membership Tier",
      "Total Transaction (RM)",
      "Last Transaction Date",
      "Wallet Value",
      "Date Joined",
      "Referral",
    ],
    ...filteredCustomerData.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.customer_tier,
      c.total_order_spend,
      c.latest_order_date,
      c.customer_wallet,
      c.active_voucher,
      c.total_order,
      c.created_at,
      c.customer_referral_code,
    ]),
  ];

  const handleAddMember = () => {
    router.push("/members/add");
  };
  
  const handleEditMember = (id) => {
    router.push(`/member/member_overview/${id}`);
  };

  const handleOrgChart = () => {
    router.push("/member/org_chart");
  };

  const handleDeleteClick = (id) => {
    setSelectedMemberId(id);
    setShowDeleteModal(true);
  };

  const deleteItem = (customerId) => {
    setCustomerData((prev) => prev.filter((c) => c.id !== customerId));
    setFilteredCustomerData((prev) => prev.filter((c) => c.id !== customerId));
    setTotalRows((prev) => Math.max(0, prev - 1));
    setShowDeleteModal(false);
    toast.success("Member removed (demo only)");
  };

  const ActionButtons = ({ row }) => {
    return (
      <div className="flex items-center gap-4 justify-end pr-2">
        {(isAdmin || hasUpdatePermission) && (
          <button
            type="button"
            data-tag="allowRowEvents"
            className="p-2 border rounded-md hover:bg-gray-100"
            onClick={() => handleEditMember(row.id)}
            title="Edit Member"
          >
            <PenSquare size={18} className="text-gray-600" />
          </button>
        )}

        <button
          className="p-2 border rounded-md hover:bg-gray-100"
          onClick={handleOrgChart}
          title="View Org Chart"
        >
          <LayoutGrid size={18} className="text-gray-600" />
        </button>

        {(isAdmin || hasDeletePermission) && (
          <button
            className="p-2 border rounded-md hover:bg-gray-100"
            onClick={() => handleDeleteClick(row.id)}
            title="Delete Member"
          >
            <Trash size={18} className="text-gray-600" />
          </button>
        )}
      </div>
    );
  };

  const columns = [
    {
      name: "Action",
      cell: (row) => <ActionButtons row={row} />,
      button: true,
      width: "180px",
      right: true,
    },
    {
      name: "Name",
      selector: (row) => row.name || "-",
      minWidth: "200px",
      wrap: true,
      sortable: true,
    },
    {
      name: "Phone Number",
      selector: (row) => row.phone || "-",
      minWidth: "180px",
      sortable: true,
    },
    {
      name: "Email Address",
      selector: (row) => row.email || "-",
      minWidth: "280px",
      sortable: true,
    },
    {
      name: "Membership Tier",
      selector: (row) => row.customer_tier_id,
      cell: (row) =>
        row.customer_tier ? (
          <span className={getTierColor(row.customer_tier)}>
            {row.customer_tier}
          </span>
        ) : (
          "-"
        ),
      minWidth: "180px",
      sortable: true,
    },
    {
      name: "Wallet Value",
      selector: (row) =>
        row.customer_wallet ? `RM ${row.customer_wallet}` : "RM0.00",
      minWidth: "150px",
      sortable: true,
    },
    {
      name: "Total Order",
      selector: (row) =>
        row.total_order ? row.total_order : 0,
      minWidth: "150px",
      sortable: true,
    },
    {
      name: "Total Spend",
      selector: (row) =>
        row.total_order_spend ? `RM ${row.total_order_spend}` : "RM0.00",
      minWidth: "150px",
      sortable: true,
    },
    {
      name: "Latest Order Date",
      selector: (row) =>
        row.latest_order_date ? row.latest_order_date : "-",
      minWidth: "200px",
      sortable: true,
    },
    {
      name: "Date Joined",
      selector: (row) => row.created_at || "-",
      minWidth: "200px",
      sortable: true,
    },
    {
      name: "Referral Code",
      selector: (row) =>
        row.customer_referral_code ? row.customer_referral_code : "-",
      sortable: true,
    },
  ];

  return (
    <div>
      <ToastContainer />
      <div>
        <h1 className="text-xl font-medium text-gray-600 mb-6 ml-3">Members</h1>
        <div className="bg-white shadow-sm overflow-hidden rounded-lg">
          <div className="px-6 py-8 flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Member</h2>
            <div className="flex gap-3">
              {(isAdmin || hasCreatePermission) && (
                <button
                  className="bg-[#312e81] text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-medium"
                  onClick={handleAddMember}
                >
                  <Plus size={20} />
                  Add New Member
                </button>
              )}
              {/* <CSVLink
                data={csvData}
                filename="members.csv"
                onClick={exportToCSV}
                className={`bg-[#312e81] text-white border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 transition ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#312e81]"
                } ${isDisabled ? "pointer-events-none" : ""}`}
              >
                <Download size={18} />
                Export Report
              </CSVLink> */}
              <button
                className="bg-[#312e81] text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-medium"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-t border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Filter by name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="text"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    placeholder="Filter by email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                    placeholder="Filter by phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Tiers</option>
                    {tierData.map((tier) => (
                      <option key={tier.id} value={tier.name}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    value={referralFilter}
                    onChange={(e) => setReferralFilter(e.target.value)}
                    placeholder="Filter by referral code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button
                  onClick={() => applyFilters()}
                  className="px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Submit
                </button>
                <button
                  onClick={clearFilters}
                  className="px-2 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center text-sm font-medium"
                >
                  <X size={16} className="mr-1" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          <DataTable
            className="py-3"
            columns={columns}
            data={filteredCustomerData}
            pagination
            paginationPerPage={limit}
            onChangeRowsPerPage={(newLimit) => setLimit(newLimit)}
            onChangePage={(newPage) => setPage(newPage)}
            persistTableHead
            customStyles={customStyles}
            sortIcon={<ChevronDown size={16} />}
            progressPending={loading}
            responsive
          />
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            deleteItem(selectedMemberId);
          }}
        />
      </div>
    </div>
  );
};

export default MemberPage;
