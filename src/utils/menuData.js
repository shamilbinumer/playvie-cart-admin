// utils/menuData.js
// utils/menuData.js
import {
  Settings,
  Folder,
  Tag,
  House,
  Box,
  Image,
  Users,
  UserCog,
  Globe,
  BookOpenText,
  Images,
  ListOrderedIcon,
  PackagePlus,
  Percent,
  Package
} from "lucide-react";

export const menuData = [
  {
    id: 1,
    title: "Dashboard",
    icon: House,
    url: "/dashboard",
    children: []
  },
  {
    id: 44,
    title: "Orders",
    icon: ListOrderedIcon,
    url: "/orders/order-list"
  },
  {
    id: 2,
    title: "Master Data",
    icon: Settings,
    url: null,
    children: [
       {
        id: 23,
        title: "Category",
        icon: Folder,
        url: "/master/category-list"
      },
      {
        id: 21,
        title: "Age Based Category",
        icon: Folder,
        url: "/master/age-based-category-list"
      },
      {
        id: 22,
        title: "Brand",
        icon: Tag,
        url: "/master/brand-list"
      },
    ]
  },
  {
    id: 3,
    title: "Product",
    icon: Box,
    url: "/product-list",
    children: []
  },
  {
    id: 33,
    title: "Inventory",
    icon: PackagePlus,
    url: "/inventory",
    children: []
  },
  {
    id: 41,
    title: "Banners",
    icon: Image,
    url: "/banners/banner-list"
  },
  {
    id: 44,
    title: "Manage Offers",
    icon: Percent,
    url:null,
    children: [
      {
        id: 441,
        title: "Recommended Products",
        icon: Package,
        url: "/offers/recommended-for-you"
      }
    ]
  },
  
  {
    id: 5,
    title: "Users",
    icon: Users,
    url: null,
    children: [
      {
        id: 51,
        title: "Customers",
        icon: Users,
        url: "/users/customers"
      },
      {
        id: 52,
        title: "Admins",
        icon: UserCog,
        url: "/users/admins"
      },
    ]
  },
  {
    id: 6,
    title: "Portfolio",
    icon: Globe,
    url: null,
    children: [
      {
        id: 61,
        title: "Service Enquiry",
        icon: BookOpenText,
        url: "/portfolio/serviceEnquiry"
      },
      {
        id: 62,
        title: "Gallery",
        icon: Images,
        url: "/portfolio/gallery"
      },
      {
        id: 63,
        title: "Blog",
        icon: Images,
        url: "/portfolio/blog/Blog"
      },
       {
        id: 64,
        title: "Service",
        icon: Images,
        url:"/portfolio/service/ServiceList"
      },

    ]
  },
  {
    id: 7,
    title: "PlaySchool Website",
    icon: Globe,
    url: null,
    children: [
      {
        id: 71,
        title: "Admission Enquiry",
        icon: BookOpenText,
        url: "/playschool/admissionEnquiry"
      },
      {
        id: 72,
        title: "Gallery",
        icon: Images,
        url: "/playschool/galley-list"
      },
      {
        id: 73,
        title: "Franchise Enquiry",
        icon: BookOpenText,
        url: "/playschool/franchiseEnquiry"
      },
    ]
  },
];