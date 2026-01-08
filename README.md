# CRM v2

### DataTable

```js
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

let [tableData, setTableData] = useState([]);
const [filter, setFilter] = useState({});
const [limit, setLimit] = useState(10);
const [page, setPage] = useState(1);
const [count, setCount] = useState(1);

const tableConfig = useMemo(() => {
    return {
      columns: [
        {
          field: "name",
          label: "Name",
          enableSorting: false, // Disable sorting
          enableHiding: false, // Disable hiding
          currency: "INR" // this for type amount,
          copy: true,
        },
        {
          label: "actions",
          field: "extra_actions",
          dropdown: false,
          actions: [
            {
              label: "Edit",
              icon: <PencilIcon className="size-4.5 stroke-1" />,
              onClick: ({_id, doc}) => { console.log(_id, doc)},
            },
            {
              label: "Delete",
              icon: <TrashIcon className="size-4.5 stroke-1" />,
              onClick: ({_id, doc, action}) => {
                // These functions allow you to control the dialog's state and behavior.
                // Pass the `action` object as a single parameter to simplify dialog handling.
                let {close, setConfirmLoading, setError, setSuccess} = action;
              },
              dialog: {
                pending: {
                  title: "Are you sure?",
                  description: "Testing and working",
                  actionText: "Log out",
                },
                success: {
                  title: "Logout successful",
                  description: "You have been logged out as requested.",
                },
                error: {
                  title: "Logout failed",
                  description:
                    "Something went wrong. Please check your internet connection and try again.",
                },
              },
            },
          ],
        },
      ],
      rows: tableData,
    };
  }, [tableData]);

<TwdTable
     data={tableConfig}
     count={count}
     selectable={false}
     handleFilterChange={(filterProps, pageCount, limitCount) => {
     fetchTableList(filterProps, pageCount, limitCount);
     setFilter(filterProps);
     setPage(pageCount);
     setLimit(limitCount);
  }}
 />
```

> Note: The `handlePageLimitChange` functions are automatically invoked when the table data is accessed ( similar to how `useEffect` behaves ). therefore, you don't need to mannually call these functions using `useEffect`.

### Columns types

1. dropdown
2. amount
3. date
4. profile
5. id
6. address
7. badge
8. bundle
9. collaborator
10. progress
11. default

### Example

```js
let data = [
  {
    id: "90df890809",
    //date you can pass as string or object

    date: "2025/06/08",
    date_time: {
      date: "2025/06/08",
      time: "12:20",
    },

    // amount can be a string or an object with amount, profit, and currency
    amount: 5000,
    amountWithProfit: {
      amount: 5000,
      profit: 10,
      currency: "INR",
    },

    profile: {
      img: "https://example.com/image.jpg",
      name: "Habeeb",
    },

    dropdown: {
      value: "pending",
      options: [
        {
          label: "Pending",
          value: "pending",
        },
      ],
    },

    address: "madakkara, kerala",

    //badge can be a string or an object with label and color
    badge: "Pending",
    badgeWithColor: {
      label: "Pending",
      color: "neutral",
      // supported colors: "success", "info", "error", "neutral", "warning"
    },

    bundle: {
      img: "https://example.com/image.jpg",
      title: "Bundle Title",
      time: "2 days",
      count: {
        label: "Items",
        value: 5,
      },
    },

    collaborator: [
      {
        img: "https://example.com/image1.jpg",
        name: "John Doe",
      },
      {
        img: "https://example.com/image2.jpg",
        name: "Jane Smith",
      },
    ],

    progress: 10,

    // if you never pass type in columns it will be considered as default type
    default: "normal text",

    // you can you you any field name for actions and that refer to that field in columns
    extra_actions: [
      // This is the field name that will be used to add actions from rows data
      {
        label: "View",
        icon: <Eye className="size-4.5 stroke-1" />,
        onClick: (data) => {
          console.log("Edit clicked", data);
        },
      },
    ],
  },
];

const tableConfig = {
  columns: [
    {
      field: "id",
      label: "ID",
      type: "id",
      enableSorting: false,
      enableHiding: false,
      copy: true, // optional, default is false - allows copying the value to clipboard
    },
    {
      field: "date",
      label: "Date",
      type: "date",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "date_time",
      label: "Date & Time",
      type: "date",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "amount",
      label: "Amount",
      type: "amount",
      currency: "USD", // optional, default is "INR" also you can pass dynamically currency type in row data
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "amountWithProfit",
      label: "Amount with Profit",
      type: "amount",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "profile",
      label: "Profile",
      type: "profile",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "profile",
      label: "Profile",
      type: "profile",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "dropdown",
      label: "Dropdown",
      type: "dropdown",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "address",
      label: "Address",
      type: "address",
      enableSorting: false,
      enableHiding: false,
      copy: true, // optional, default is false - allows copying the value to clipboard
    },
    {
      field: "badge",
      label: "Badge",
      type: "badge",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "badgeWithColor",
      label: "Badge with Color",
      type: "badge",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "bundle",
      label: "Bundle",
      type: "bundle",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "collaborator",
      label: "Collaborator",
      type: "collaborator",
      visibleCount: 5,
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "progress",
      label: "Progress",
      type: "Progress",
      enableSorting: false,
      enableHiding: false,
    },
    {
      field: "default",
      label: "Default",
      type: "default", // If you never pass type it will be considered as default type
      enableSorting: false,
      enableHiding: false,
      copy: true, // optional, default is false - allows copying the value to clipboard
    },

    {
      label: "actions",
      field: "extra_actions", // This is the field name that will be used to add actions from rows data
      dropdown: false,
      actions: [
        {
          label: "Edit",
          icon: <PencilIcon className="size-4.5 stroke-1" />,
          onClick: (data) => {
            console.log("Edit clicked", data);
          },
        },
        {
          label: "Delete",
          icon: <TrashIcon className="size-4.5 stroke-1" />,
          onClick: (data) => {
            console.log("Edit clicked", data);
          },
          dialog: {
            pending: {
              title: "Are you sure?",
              description: "It will delete the record permanently.",
              actionText: "Delete",
            },
            success: {
              title: "Delete successful",
              description: "The record has been deleted successfully.",
            },
            error: {
              title: "Error",
              description:
                "Something went wrong. Please check your internet connection and try again.",
            },
          },
        },
      ],
    },
  ],
  rows: data,
};
```

## Basic Page Structure

configuration snippets

```json
"srv version 2": {
		"scope": "jsx",
		"prefix": "rafse",
		"body": [
			"import { Page } from 'components/shared/Page';",
			"",
			"const ${1:${TM_FILENAME_BASE}} = () => {",
			"",
			"\treturn (",
			"\t\t<Page title='${2:${TM_FILENAME_BASE}}'>",
			"\t\t\t<div className='transition-content w-full px-(--margin-x) pt-5 lg:pt-6'>",
			"\t\t\t\t<div className='min-w-0'>",
			"\t\t\t\t<h2 className='dark:text-dark-50 truncate text-xl font-medium tracking-wide text-gray-800'>${3:${TM_FILENAME_BASE}}</h2>",
			"\t\t\t\t</div>",
			"\t\t\t</div>",
			"\t\t</Page>",
			"\t);",
			"};",
			"",
			"export default ${1:ComponentName};"
		],
		"description": "Create a new page with a title and basic structure"
	}
```
