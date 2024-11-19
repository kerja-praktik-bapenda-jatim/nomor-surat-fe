"use client";

import {ScrollArea} from "@mantine/core";

import {UserButton} from "@/components/UserButton/UserButton";
import type {NavItem} from "@/types/nav-item";
import {NavLinksGroup} from "./NavLinksGroup";
import classes from "./Navbar.module.css";
import {useEffect, useState} from "react";

interface Props {
	data: NavItem[];
	hidden?: boolean;
}

export function Navbar({data}: Props) {
	const [user, setUser] = useState({ userName: "Guest", departmentName: "Unknown Department" });

	useEffect(() => {
		const userName = localStorage.getItem("userName") || "Guest";
		const departmentName = localStorage.getItem("departmentName") || "Unknown Department";
		setUser({ userName, departmentName });
	}, []);

	const links = data.map((item) => (
		<NavLinksGroup key={item.label} {...item} />
	));

	return (
		<>
			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>

			<div className={classes.footer}>
				<UserButton
					image={`https://eu.ui-avatars.com/api/?name=${encodeURIComponent(user.userName)}&size=250`}
					name={user.userName}
					email={user.departmentName}
				/>
			</div>
		</>
	);
}
