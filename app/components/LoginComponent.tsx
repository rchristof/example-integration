"use client";

import { use, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Stack, Typography, Link } from "@mui/material";
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
        setIsLogin(true);
        setNotification(
          "Registration successful! Check your email to confirm your account."
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
        sessionStorage.setItem("jwtToken", data.jwtToken);
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
      <DisplayHeading mt="12px">{isLogin ? "Login to your account" : "Get Started Today"}</DisplayHeading>

      {errorMessage && (
        <Typography color="error" mb={2}>
          {errorMessage}
        </Typography>
      )}

      <Stack component="form" gap="24px" mt="28px" onSubmit={handleSubmit}>
        <Stack gap="20px">
          <FieldContainer>
            <FieldLabel required align="left">Email</FieldLabel>
            <TextField
              name="email"
              placeholder="example@companyemail.com"
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
                <FieldLabel required align="left">Company Name</FieldLabel>
                <TextField
                  name="companyName"
                  placeholder="Enter your company's name"
                  value={values.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.companyName && !!errors.companyName}
                  helperText={touched.companyName && errors.companyName}
                />
              </FieldContainer>

              <FieldContainer>
                <FieldLabel required align="left">Name</FieldLabel>
                <TextField
                  name="name"
                  placeholder="Enter your full name"
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
            <FieldLabel required align="left">Password</FieldLabel>
            <PasswordField
              name="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
            />
          </FieldContainer>

          {isLogin && (
            <Box textAlign="left">
              <Link href="/forgot-password" style={{ color: "#27A376", cursor: "pointer" }}>
              Forgot Password
              </Link>
            </Box>
          )}
        </Stack>

        <SubmitButton
          type="submit"
          disabled={!isValid || isLoading}
          loading={isLoading}
        >
          {isLogin ? "Login" : "Cadastrar"}
        </SubmitButton>

        <Typography mt="16px" fontSize="14px" textAlign="center" color="#A0AEC0">
          {isLogin ? "You’re new in here?" : "Already have an account?"}{" "}
          <Link href="#" onClick={toggleIsLogin} style={{ color: "#27A376", cursor: "pointer" }}>
            {isLogin ? "Create Account" : "Login here"}
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
}
