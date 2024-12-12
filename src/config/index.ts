import {IconMail, IconMailUp} from "@tabler/icons-react";
import type {NavItem} from "@/types/nav-item";

export const navLinks: NavItem[] = [
	{
		label: "Surat Keluar", 
		icon: IconMailUp,
		initiallyOpened: true,
		links: [
			{
				label: "Surat Keluar Saya",
				link: "/surat",
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
				label: "Spare Nota Dinas", 
				link: "/nota/spare"
			},
		],
	},
	
];
