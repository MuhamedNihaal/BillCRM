export const moduleList = {
  title: "Test",
  mainMenu: [
    {
      title: "Test Catalog",
      subMenus: [
        {
          title: "Test",
        },
        {
          title: "Group",
        },
        {
          title: "Sub Package",
        },
        {
          title: "Package",
        },
        {
          title: "Culture",
        },
        {
          title: "Examination",
        },
      ],
    },
    {
      title: "Customer",
      subMenus: [
        {
          title: "List",
        },
        {
          title: "Category",
        },
      ],
    },
    {
      title: "Doctor",
    },
    {
      title: "Lab",
    },
    {
      title: "Manges",
      subMenus: [
        {
          title: "Unit",
        },
        {
          title: "Methods",
        },
        {
          title: "Antibiotic",
        },
      ],
    },
  ],
};

export const checkAllPermissionStatuses = (modules) => {
  const keys = ["enabled", "view", "create", "edit", "remv"];
  const result = {};

  keys.forEach((key) => {
    let total = 0;
    let trueCount = 0;

    const check = (items) => {
      items.forEach((item) => {
        if (typeof item[key] === "boolean" && item.enabled) {
          total++;
          if (item[key]) trueCount++;
        }
        if (Array.isArray(item.subMenus) && item.subMenus.length > 0) {
          check(item.subMenus);
        }
      });
    };

    check(modules);

    if (trueCount === 0) result[key] = "none";
    else if (trueCount === total) result[key] = "full";
    else result[key] = "some";
  });

  return result;
};
