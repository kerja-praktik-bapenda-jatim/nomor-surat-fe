import {IconMail, IconMailPlus, IconMailQuestion} from "@tabler/icons-react";
import type {NavItem} from "@/types/nav-item";

export const navLinks: NavItem[] = [
	{label: "Surat Saya", icon: IconMail, link: "/dashboard/surat"},
	{label: "Tambah Surat", icon: IconMailPlus, link: "/dashboard/surat/tambah"},
	{label: "Spare Surat", icon: IconMailQuestion, link: "/dashboard/surat/spare"},
];
