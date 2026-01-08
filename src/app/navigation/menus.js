// export const modules = [
//   {
//     id: "test",
//     type: NAV_TYPE_ROOT,
//     path: "test",
//     redirectUrl: "test/test/test",
//     title: "Tests",
//     Icon: DashboardsIcon,
//     childs: [
//       {
//         id: "test.test",
//         type: NAV_TYPE_COLLAPSE,
//         path: "test/test",
//         title: "Test",
//         Icon: DashboardsIcon,
//         childs: [
//           {
//             id: "test.test.test",
//             type: NAV_TYPE_ITEM,
//             path: "test/test/test",
//             title: "Test",
//           },
//           {
//             id: "test.test.group",
//             type: NAV_TYPE_ITEM,
//             path: "test/test/group",
//             title: "Group",
//           },
//         ],
//       },
//       {
//         id: "test.user",
//         type: NAV_TYPE_COLLAPSE,
//         path: "test/user",
//         title: "User",
//         Icon: DashboardsIcon,
//         childs: [
//           {
//             id: "test.user.user",
//             type: NAV_TYPE_ITEM,
//             path: "test/user/user",
//             title: "Test",
//           },
//           {
//             id: "test.user.branch",
//             type: NAV_TYPE_ITEM,
//             path: "test/user/branch",
//             title: "Group",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "finance",
//     type: NAV_TYPE_ROOT,
//     settingType: NAV_TYPE_ITEM,
//     path: "finance",
//     redirectUrl: "finance/chart-of-account",
//     title: "Finance",
//     Icon: DashboardsIcon,
//     childs: [
//       {
//         id: "finance.chart-of-account",
//         type: NAV_TYPE_ITEM,
//         path: "finance/chart-of-account",
//         title: "Chart of Account",
//         Icon: DashboardsIcon,
//       },
//       {
//         id: "finance.fund-transfer",
//         type: NAV_TYPE_COLLAPSE,
//         path: "finance/fund-transfer",
//         title: "fund transfer",
//         Icon: DashboardsIcon,
//         childs: [
//           {
//             id: "finance.fund-transfer.log",
//             type: NAV_TYPE_ITEM,
//             path: "finance/fund-transfer/log",
//             title: "Log",
//           },
//         ],
//       },
//     ],
//   },
// ];

export const modules = [
  {
    _id: "67e3d240812c99c2ff62d421",
    code: "fin",
    Icon: "modules/file-1747202786208-775279721.png",
    redirectUrl: "/finance-dashboard",
    path: "/finance",
    id: "67e3d240812c99c2ff62d421",
    title: "Finance",
    type: "root",
    order: 2,
    childs: [],
  },
  {
    _id: "67ce8b1a7c81557bbd71b372",
    code: "inv",
    Icon: "Thwaha",
    redirectUrl: "/inventory",
    path: "/inventory",
    id: "67ce8b1a7c81557bbd71b372",
    title: "Inventory",
    type: "root",
    order: 999,
    childs: [
      {
        _id: "67d01663bf063d2eaca97547",
        title: "rule",
        Icon: "FaAudioDescriptio",
        path: "/inventory/rule",
        order: 1,
        type: "collapse",
        childs: [
          {
            _id: "67d404729f7adb5fdf7630c9",
            mainMenu: "67d01663bf063d2eaca97547",
            Icon: "fa fa-manage",
            order: 1,
            path: "/inventory/rule/units",
            title: "units",
            type: "item",
          },
        ],
      },
    ],
  },
];
