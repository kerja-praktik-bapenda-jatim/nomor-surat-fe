import { Flex, Text } from "@mantine/core";
import Link from "next/link";
import classes from "./Logo.module.css";

interface Props {
  width?: string;
  height?: string;
}

export const Logo: React.FC<Props> = () => {
  return (
    <Flex direction="row" align="center" gap={4}>
      <Link
        href="/"
        style={{ textDecoration: "none" }}
        className={classes.heading}
      >
        <Text fw={700} size="xl">
          SINORAT
          <Text component="span" fw={100} size="xs" className={classes.subheading}>
            Sistem Informasi Surat
          </Text>
        </Text>
      </Link>
    </Flex>
  );
};
