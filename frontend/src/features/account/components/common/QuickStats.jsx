import {
  useNavigate,
} from "react-router-dom";

export default function QuickStats({
  stats = [],
  user,
}) {

  const navigate =
    useNavigate();

  // ================= HANDLE CARD NAVIGATION =================
  const handleNavigation = (title) => {

  switch (title) {

    // ADMIN

    case "Users Managed":
      if (!user?._id) return;
      navigate(`/dashboard/users?managedBy=${user._id}`);
      break;

    case "Orders Managed":
      if (!user?._id) return;
      navigate(`/dashboard/orders?managedBy=${user._id}`);
      break;

    case "Revenue":
      navigate("/dashboard/reports");
      break;


    // CUSTOMER

    case "Total Orders":
      navigate("/dashboard/orders");
      break;

    case "Total Spent":
      navigate("/dashboard");
      break;

    case "Saved Addresses":
      navigate("/dashboard/settings/addresses");
      break;

    default:
      break;
  }
};

  return (

    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-3
        gap-6
      "
    >

      {
        stats.length > 0 ? (

          stats.map((item) => {

            const isClickable = [
              "Users Managed",
              "Orders Managed",
              "Revenue",
              "Total Orders",
              "Total Spent",
              "Saved Addresses",
            ].includes(item.title);

            const Icon =
              item.icon;

            return (

              <div
                key={item.id}
                onClick={() =>
                  isClickable &&
                  handleNavigation(
                    item.title
                  )
                }
                className={`
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-green-100
                  bg-white
                  p-6
                  transition-all
                  duration-300

                  ${isClickable
                    ? `
                        cursor-pointer
                        hover:-translate-y-1
                        hover:shadow-xl
                        hover:border-green-300
                      `
                    : ""
                  }
                `}
              >

                {/* ================= BACKGROUND CIRCLE ================= */}
                <div
                  className="
                    absolute
                    -top-7
                    -right-7
                    w-28
                    h-28
                    bg-green-100
                    rounded-full
                    opacity-60
                  "
                />

                {/* ================= CONTENT ================= */}
                <div className="relative z-10">

                  {/* ================= ICON ================= */}
                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-gradient-to-br
                      from-green-100
                      to-emerald-100
                      text-green-700
                      flex
                      items-center
                      justify-center
                      mb-6
                      shadow-sm
                    "
                  >

                    {
                      Icon ? (
                        <Icon size={26} />
                      ) : null
                    }

                  </div>

                  {/* ================= TITLE ================= */}
                  <p
                    className="
                      text-base
                      font-semibold
                      text-[#475467]
                    "
                  >
                    {item.title}
                  </p>

                  {/* ================= VALUE ================= */}
                  <h2
                    className="
                      text-4xl
                      font-bold
                      text-gray-900
                      mt-3
                      tracking-tight
                    "
                  >
                    {item.value}
                  </h2>

                  {/* ================= BOTTOM LABEL ================= */}
                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      rounded-full
                      bg-green-50
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-green-700
                    "
                  >

                    Live Overview

                  </div>

                </div>

              </div>
            );
          })

        ) : (

          <div
            className="
              col-span-full
              flex
              flex-col
              items-center
              justify-center
              py-16
              rounded-3xl
              border
              border-dashed
              border-green-200
              bg-green-50/40
            "
          >

            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-green-100
                flex
                items-center
                justify-center
                mb-4
              "
            >

              📊

            </div>

            <h3
              className="
                text-lg
                font-semibold
                text-gray-800
              "
            >
              No Stats Available
            </h3>

            <p
              className="
                text-[#475467]
                font-medium
                mt-2
              "
            >
              Stats will appear here once data is available
            </p>

          </div>
        )
      }

    </div>
  );
}