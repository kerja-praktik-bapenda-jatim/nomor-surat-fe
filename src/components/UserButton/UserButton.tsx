import {
  Avatar,
  Button,
  Divider,
  Flex,
  Stack,
  Text,
  UnstyledButton,
  type UnstyledButtonProps,
} from "@mantine/core";
import classes from "./UserButton.module.css";
import { modals } from "@mantine/modals";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface UserButtonProps extends UnstyledButtonProps {
  image: string;
  name: string;
  email: string;
}

export function UserButton({ image, name, email }: UserButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.clear();
    router.push('/login');
  };

  const handleChangePassword = () => {
    router.push('/changepassword');
  };

  const openProfileModal = () => {
    modals.open({
      title: 'Profile',
      centered: true,
      children: (
        <>
        <Stack gap="md">
        {/* Informasi pengguna */}
        <Stack gap="xs">
          <Text size="md" fw={700}>Username:</Text>
          <Text size="sm" fw={400}>{name}</Text>

          <Text size="md" fw={700}>Bidang:</Text>
          <Text size="sm" fw={400}>{email}</Text>
        </Stack>

        {/* Divider */}
        <Divider my="sm" />

        {/* Tombol aksi */}
        <Stack gap="sm">
          <Button onClick={() => {modals.closeAll(); handleChangePassword();}} variant="filled" fullWidth>
            Ubah Password
          </Button>
          <Button onClick={() => {modals.closeAll(); handleLogout();}} color="red" variant="outline" fullWidth>
            Logout
          </Button>
        </Stack>
      </Stack>
        </>
      ),
    });
  };

  return (
    <UnstyledButton className={classes.user} onClick={openProfileModal}>
      <Flex direction="row" gap={8}>
        <Avatar src={image} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" w="100%">
            {name}
          </Text>

          <Text c="dimmed" size="xs">
            {email}
          </Text>
        </div>
      </Flex>
    </UnstyledButton>
  );
}
