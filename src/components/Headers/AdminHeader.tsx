"use client";

import {ActionIcon, Box, Button, Drawer, Stack, TextInput} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch, IconSettings } from "@tabler/icons-react";
import classes from "./AdminHeader.module.css";
import { DirectionSwitcher } from "../DirectionSwitcher/DirectionSwitcher";
import { Logo } from "../Logo/Logo";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";

interface Props {
  burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
  const [opened, { close, open }] = useDisclosure(false);
	const router = useRouter();

	const handleLogout = () => {
		Cookies.remove('authToken');
		router.push('/login');
	};

  return (
    <header className={classes.header}>
      {burger && burger}
      <Logo />
      <Box style={{ flex: 1 }} />
      {/* <TextInput
        placeholder="Search"
        variant="filled"
        leftSection={<IconSearch size="0.8rem" />}
        style={{}}
      /> */}
      <ActionIcon onClick={open} variant="subtle">
        <IconSettings size="1.25rem" />
      </ActionIcon>

      <Drawer
        opened={opened}
        onClose={close}
        title="Settings"
        position="right"
        transitionProps={{ duration: 0 }}
      >
        <Stack gap="lg">
          <ThemeSwitcher />
          <DirectionSwitcher />
					<Button onClick={handleLogout} color="red" variant="outline">
						Logout
					</Button>
        </Stack>
      </Drawer>
    </header>
  );
}
