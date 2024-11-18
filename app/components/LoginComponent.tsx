"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Stack,
  Typography,
  Link,
} from "@mui/material";
import FieldContainer from "@components/NonDashboardComponents/FormElementsV2/FieldContainer";
import FieldLabel from "@components/NonDashboardComponents/FormElementsV2/FieldLabel";
import SubmitButton from "@components/NonDashboardComponents/FormElementsV2/SubmitButton";
import TextField from "@components/NonDashboardComponents/FormElementsV2/TextField";
import PasswordField from "@components/NonDashboardComponents/FormElementsV2/PasswordField";
import DisplayHeading from "@components/NonDashboardComponents/DisplayHeading";

interface LoginComponentProps {
  onNext: () => void;
}

export default function LoginComponent({ onNext }: LoginComponentProps) {
  const { setIsAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [notification, setNotification] = useState<string | null>(null); // Para exibir mensagens de sucesso

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Email inválido").required("Email é obrigatório"),
    password: Yup.string().required("Senha é obrigatória"),
    companyName: isLogin
      ? Yup.string()
      : Yup.string().required("Nome da empresa é obrigatório"),
    name: isLogin
      ? Yup.string()
      : Yup.string().required("Seu nome é obrigatório"),
  });

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
        await handleLogin(values);
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
        // Redireciona para login com uma notificação
        setIsLogin(true);
        setNotification(
          "Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta."
        );
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

  const handleLogin = async (values: any) => {
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
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        onNext();
      } else {
        setErrorMessage(data.message || "Erro ao fazer login.");
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage(error.message || "Erro ao conectar com a API.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIsLogin = () => {
    setIsLogin(!isLogin);
    setErrorMessage(null);
    formik.resetForm();
  };

  return (
    <Box>
      {notification && (
        <Typography color="success" mb={2}>
          {notification}
        </Typography>
      )}
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
        </Stack>

        <Stack gap="16px">
          <SubmitButton
            type="submit"
            disabled={!isValid || isLoading}
            loading={isLoading}
          >
            {isLogin ? "Login" : "Cadastrar"}
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
    </Box>
  );
}
