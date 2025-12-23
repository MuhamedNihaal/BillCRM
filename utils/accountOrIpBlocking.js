export let accountOrIpBlocking = [
  { attempts: 15, block: "permanent" },
  { attempts: 13, block: { value: 1, unit: "days" } },
  { attempts: 10, block: { value: 1, unit: "hours" } },
  { attempts: 6, block: { value: 15, unit: "minutes" } },
  { attempts: 4, block: { value: 5, unit: "minutes" } },
];
