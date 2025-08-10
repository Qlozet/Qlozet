interface NavItem {
    item: string;
    link: string;
    navWidth: string;
    handleFunction: (data: string) => void;
}

// This data seems to be tightly coupled with component state logic.
// It's better to manage this state within the component itself using useState.
// However, to preserve the structure, I've typed it here.
export const settingNav: NavItem[] = [
    {
      item: "Shop details",
      link: "",
      navWidth: "min-w-[7.5rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        // This function would need to be connected to component state setters
        console.log(data);
      },
    },
    {
      item: "Billing and invoice",
      navWidth: "min-w-[10.5rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data) => {
        console.log(data);
      },
    },
    {
      item: "Warehouses",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      link: "",
      handleFunction: (data) => {
        console.log(data);
      },
    },
    {
      item: "Users and permissions",
      link: "",
      navWidth: "min-w-[13rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        console.log(data);
      },
    },
    {
      item: "Categories",
      navWidth: "min-w-[8rem] lg:min-w-w-[0]",
      handleFunction: (data) => {
        console.log(data);
      },
    },
  ];
