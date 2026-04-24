import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

type WelcomeEmailProps = {
  firstName?: string;
};

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Fundo Mutualista</Preview>
      <Body style={{ backgroundColor: "#F1EFE8", padding: "24px" }}>
        <Container
          style={{
            backgroundColor: "#FFFFFF",
            padding: "24px",
            borderRadius: "8px",
          }}
        >
          <Heading>Bem-vindo{firstName ? `, ${firstName}` : ""}!</Heading>
          <Text>
            A sua conta foi criada com sucesso. Este template pode ser
            reutilizado para onboarding e notificacoes transacionais.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
