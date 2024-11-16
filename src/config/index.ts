import {IconMail, IconMailPlus, IconMailQuestion} from "@tabler/icons-react";
import type {NavItem} from "@/types/nav-item";

export const navLinks: NavItem[] = [
	{
		label: "Surat Keluar", 
		icon: IconMail,
		initiallyOpened: true,
		links: [
			{
				label: "Surat Keluar Saya",
				link: "/surat",
			},
			{
				label: "Tambah Surat Keluar", 
				link: "/surat/add"
			},
			{
				label: "Spare Surat Keluar", 
				link: "/surat/spare"
			},
		],
	},
	{
		label: "Nota Dinas", 
		icon: IconMail,
		initiallyOpened: true,
		links: [
			{
				label: "Nota Dinas Saya",
				link: "/nota",
			},
			{
				label: "Tambah Nota Dinas", 
				link: "/nota/add"
			},
			{
				label: "Spare Nota Dinas", 
				link: "/nota/spare"
			},
		],
	},
	
];
