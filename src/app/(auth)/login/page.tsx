"use client";

import { Box, Title, Text, Image } from "@mantine/core";
import { LoginForm } from "@/components/Auth/LoginForm";
import { useAuthRedirect } from "@/services/auth";
import classes from "../layout.module.css";

export default function Login() {
  useAuthRedirect();

  return (
    <Box className={classes.wrapper}>
      <Image h={170} w="auto" fit="contain" src="/bg.png" />

      <Title order={1} fw={700} ta="center" mt={25}>
        SINORAT
        <Text fw={100} size="sm">
          Sistem Informasi Surat Bapenda Jatim
        </Text>
      </Title>

      <Box w={400}>
        <LoginForm />
      </Box>
    </Box>
  );
}
