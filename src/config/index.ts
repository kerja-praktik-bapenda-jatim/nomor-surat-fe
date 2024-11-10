import {IconComponents, IconDashboard,} from "@tabler/icons-react";
import type {NavItem} from "@/types/nav-item";

export const navLinks: NavItem[] = [
	{label: "Dashboard", icon: IconDashboard, link: "/dashboard"},

	{
		label: "Components",
		icon: IconComponents,
		initiallyOpened: true,
		links: [
			{
				label: "Table",
				link: "/dashboard/table",
			},
			{
				label: "Form",
				link: "/dashboard/form",
			},
			{
				label: "Surat Saya",
				link: "/dashboard/surat",
			},
			{
				label: "Tambah Surat",
				link: "/dashboard/surat/tambah",
			},
			{
				label: "Spare Surat",
				link: "/dashboard/surat/spare",
			},
		],
	},
];
