// utils/menuData.js
import {
  Settings,
  Folder,
  Tag,
  House,
  Box
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


];