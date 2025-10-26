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
  Images
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
    id: 2,
    title: "Master Data",
    icon: Settings,
    url: null,
    children: [
      {
        id: 21,
        title: "Category",
        icon: Folder,
        url: "/master/category-list"
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
    id: 4,
    title: "Banners",
    icon: Image,
    url: null,
    children: [
      {
        id: 41,
        title: "Banners",
        icon: Image,
        url: "/banners/banner-list"
      },
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
        id: 61,
        title: "Gallery",
        icon: Images,
        url: "/portfolio/gallery"
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
        url: "/playschool/galley"
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