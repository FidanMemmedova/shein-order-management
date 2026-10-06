import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Input, Result, Spin } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { SessionContext } from "../../lib/auth";
import "./AuthGate.css";

interface LoginValues {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async ({ email, password }: LoginValues) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "E-mail və ya parol yanlışdır."
          : authError.message
      );
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <Card className="auth-card">
        <div className="auth-card__brand">
          <span className="brand__mark">F</span>
          <div>
            <h1>Fidan Business</h1>
            <p>Shein və iHerb sifarişləri · hesabınıza daxil olun</p>
          </div>
        </div>

        {error && <Alert type="error" message={error} showIcon className="auth-card__error" />}

        <Form<LoginValues> layout="vertical" size="large" requiredMark={false} onFinish={handleLogin}>
          <Form.Item
            label="E-mail"
            name="email"
            rules={[
              { required: true, message: "E-maili daxil edin" },
              { type: "email", message: "E-mail düzgün deyil" },
            ]}
          >
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item label="Parol" name="password" rules={[{ required: true, message: "Parolu daxil edin" }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Daxil ol
          </Button>
        </Form>
      </Card>
    </div>
  );
};

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="auth-screen">
        <Result
          status="warning"
          title="Verilənlər bazası qoşulmayıb"
          subTitle="VITE_SUPABASE_URL və VITE_SUPABASE_ANON_KEY dəyişənlərini .env faylına (Vercel-də isə Environment Variables bölməsinə) əlavə edin."
        />
      </div>
    );
  }

  if (checking) {
    return (
      <div className="auth-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
};

export default AuthGate;
