// app/components/LoginComponent.tsx

"use client";

import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Stack,
  Typography,
  Link,
} from "@mui/material";
import FieldContainer from "./NonDashboardComponents/FormElementsV2/FieldContainer";
import FieldLabel from "./NonDashboardComponents/FormElementsV2/FieldLabel";
import SubmitButton from "./NonDashboardComponents/FormElementsV2/SubmitButton";
import TextField from "./NonDashboardComponents/FormElementsV2/TextField";
import PasswordField from "./NonDashboardComponents/FormElementsV2/PasswordField";
import DisplayHeading from "./NonDashboardComponents/DisplayHeading";

interface LoginComponentProps {
  onNext: () => void;
}

export default function LoginComponent({ onNext }: LoginComponentProps) {
  const { setJwtToken } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCredentials, setRegistrationCredentials] = useState<{ email: string; password: string } | null>(null);

  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      email: Yup.string().email("Email inválido").required("Email é obrigatório"),
      password: Yup.string().required("Senha é obrigatória"),
      companyName: isLogin
        ? Yup.string()
        : Yup.string().required("Nome da empresa é obrigatório"),
      name: isLogin
        ? Yup.string()
        : Yup.string().required("Seu nome é obrigatório"),
    });
  }, [isLogin]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      companyName: "",
      name: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (isLogin) {
        await handleLinkAccount(values);
      } else {
        await handleCreateAccount(values);
      }
    },
  });

  const { values, touched, errors, handleChange, handleBlur, handleSubmit, isValid } = formik;

  const handleCreateAccount = async (values: any) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          legalCompanyName: values.companyName,
          name: values.name,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNeedsEmailConfirmation(true);
        setRegistrationCredentials({ email: values.email, password: values.password });
      } else {
        setErrorMessage(data.message || "Erro ao criar conta.");
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      setErrorMessage(error.message || "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async (values: any) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const jwtToken = data.jwtToken;
        if (jwtToken) {
          setJwtToken(jwtToken);
          console.log(jwtToken);
          onNext();
        } else {
          console.error("jwtToken não está presente na resposta da API");
          setErrorMessage("Falha ao obter token de autenticação.");
        }
      } else {
        const apiMessage = data.message || "Erro ao fazer login.";
        setErrorMessage(apiMessage);
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage(error.message || "Erro ao conectar com a API do Omnistrate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmailAndLogin = async () => {
    if (registrationCredentials) {
      await handleLinkAccount(registrationCredentials);
    } else {
      setErrorMessage("Credenciais de registro não encontradas. Por favor, faça login manualmente.");
    }
  };

  const toggleIsLogin = () => {
    setIsLogin(!isLogin);
    setErrorMessage(null);
    formik.resetForm();
  };

  return (
    <Box>
      {needsEmailConfirmation ? (
        <Box textAlign="center">
          <Typography mb={2}>
            Um email de confirmação foi enviado para <strong>{formik.values.email}</strong>. Por favor, confirme seu email para continuar.
          </Typography>
          <SubmitButton
            onClick={handleConfirmEmailAndLogin}
            disabled={isLoading}
            loading={isLoading}
          >
            Já confirmei meu email
          </SubmitButton>
          <Typography mt={2} variant="body2">
            Caso não tenha recebido o email, verifique sua caixa de spam ou{" "}
            <Link href="#" color="primary">
              solicite outro
            </Link>.
          </Typography>
        </Box>
      ) : (
        <>
          <DisplayHeading mt="24px">{isLogin ? "Login na sua conta" : "Crie sua conta"}</DisplayHeading>

          {errorMessage && (
            <Typography color="error" mb={2}>
              {errorMessage}
            </Typography>
          )}

          <Stack component="form" gap="32px" mt="44px" onSubmit={handleSubmit}>
            <Stack gap="30px">
              <FieldContainer>
                <FieldLabel required>Email</FieldLabel>
                <TextField
                  name="email"
                  id="email"
                  placeholder="Digite seu email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
              </FieldContainer>

              {!isLogin && (
                <>
                  <FieldContainer>
                    <FieldLabel required>Nome da Empresa</FieldLabel>
                    <TextField
                      name="companyName"
                      id="companyName"
                      placeholder="Digite o nome da sua empresa"
                      value={values.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.companyName && !!errors.companyName}
                      helperText={touched.companyName && errors.companyName}
                    />
                  </FieldContainer>

                  <FieldContainer>
                    <FieldLabel required>Seu Nome</FieldLabel>
                    <TextField
                      name="name"
                      id="name"
                      placeholder="Digite seu nome"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && !!errors.name}
                      helperText={touched.name && errors.name}
                    />
                  </FieldContainer>
                </>
              )}

              <FieldContainer>
                <FieldLabel required>{isLogin ? "Senha" : "Crie uma senha"}</FieldLabel>
                <PasswordField
                  name="password"
                  id="password"
                  placeholder={isLogin ? "Digite sua senha" : "Crie uma senha"}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
              </FieldContainer>

              {isLogin && (
                <Link
                  href="#"
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "22px",
                    color: "#687588",
                  }}
                >
                  Esqueceu a senha?
                </Link>
              )}
            </Stack>

            <Stack gap="16px">
              <SubmitButton
                type="submit"
                disabled={!isValid || isLoading}
                loading={isLoading}
              >
                {isLogin ? "Login" : "Inscrever-se"}
              </SubmitButton>
            </Stack>
          </Stack>

          <Typography
            mt="22px"
            fontWeight="500"
            fontSize="14px"
            lineHeight="22px"
            color="#A0AEC0"
            textAlign="center"
          >
            {isLogin ? "Novo por aqui?" : "Já tem uma conta?"}{" "}
            <Link
              href="#"
              onClick={toggleIsLogin}
              style={{ color: "#27A376", cursor: "pointer" }}
            >
              {isLogin ? "Crie uma conta" : "Login"}
            </Link>
          </Typography>
        </>
      )}
    </Box>
  );
}
