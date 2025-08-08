"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  ShoppingBag,
  ChartBar,
  Lightning,
  Shield,
  Users,
  Check,
  CaretRight,
  Sparkle,
  Clock,
  Calendar,
  Scissors,
} from "@phosphor-icons/react";

interface HomeContentProps {
  isLoggedIn: boolean;
}

export function HomeContent({ isLoggedIn = false }: HomeContentProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="position-relative py-5">
        <div className="position-absolute top-0 start-0 end-0 h-100 bg-gradient-to-br from-light to-white opacity-70"></div>

        <div className="container position-relative py-5">
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="badge bg-light text-primary mb-3">
                  Novo! Versão 2.0 disponível
                </span>

                <h1 className="display-4 fw-bold mb-4">
                  Transforme seu WhatsApp em um
                  <motion.span
                    className="d-inline-block position-relative text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {" "}
                    Sistema de Agendamento
                    <motion.span
                      className="position-absolute bottom-0 start-0 w-100 h-2 bg-primary opacity-25 rounded"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    ></motion.span>
                  </motion.span>
                </h1>

                <p className="lead mb-4 text-secondary">
                  Automatize seu atendimento, gerencie sua agenda e aumente
                  seus agendamentos com nossa plataforma completa de gestão de serviços
                  via WhatsApp.
                </p>

                <div className="d-flex gap-3">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="btn btn-primary btn-lg px-4"
                    >
                      Acessar Painel{" "}
                      <CaretRight className="ms-2" size={20} weight="bold" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="btn btn-primary btn-lg px-4"
                      >
                        Começar Grátis{" "}
                        <Sparkle className="ms-2" size={20} weight="fill" />
                      </Link>
                      <Link
                        href="/login"
                        className="btn btn-outline-primary btn-lg px-4"
                      >
                        Fazer Login
                      </Link>
                    </>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 mt-4">
                  <div className="d-flex">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-circle bg-light border-2 border-white d-flex align-items-center justify-content-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          marginLeft: i > 1 ? "-8px" : "0",
                        }}
                      >
                        <span className="small fw-medium">{i}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-secondary small">
                    <span className="fw-medium">+2.500</span> empresas já
                    utilizam
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6 mt-5 mt-lg-0">
              <motion.div
                className="position-relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="position-absolute top-0 start-50 translate-middle-x">
                  <div
                    className="bg-primary rounded-circle"
                    style={{
                      width: "250px",
                      height: "250px",
                      filter: "blur(80px)",
                      opacity: "0.3",
                    }}
                  ></div>
                </div>

                <div className="card border-0 shadow-lg overflow-hidden">
                  <div className="card-header bg-white d-flex align-items-center p-2 border-0">
                    <div className="d-flex gap-1 me-2">
                      <div
                        className="rounded-circle bg-danger"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                      <div
                        className="rounded-circle bg-warning"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                      <div
                        className="rounded-circle bg-success"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                    </div>
                    <div className="small text-center w-100 text-secondary">
                      Agenda AI - Dashboard
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <div className="d-flex flex-column gap-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary"
                            style={{ width: "40px", height: "40px" }}
                          >
                            AI
                          </div>
                          <div>
                            <div className="fw-medium">Agenda AI</div>
                            <div className="small text-secondary">
                              Dashboard
                            </div>
                          </div>
                        </div>
                        <div className="small fw-medium text-primary">
                          Online
                        </div>
                      </div>

                      <div className="row g-3">
                        {[
                          {
                            label: "Agendamentos Hoje",
                            value: "12",
                            change: "+15%",
                          },
                          {
                            label: "Taxa de Ocupação",
                            value: "85%",
                            change: "+8%",
                          },
                          {
                            label: "Taxa de Resposta",
                            value: "98%",
                            change: "+2%",
                          },
                          {
                            label: "Produtos Vendidos",
                            value: "124",
                            change: "+18%",
                          },
                        ].map((stat, i) => (
                          <div className="col-6" key={i}>
                            <div className="card card-status-primary p-3 h-100">
                              <div className="small text-secondary">
                                {stat.label}
                              </div>
                              <div className="fs-5 fw-semibold gradient-number">
                                {stat.value}
                              </div>
                              <div className="small text-success">
                                {stat.change}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="chart-placeholder">
                        <ChartBar
                          size={64}
                          className="text-secondary opacity-25"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
              Recursos
            </span>
            <h2 className="display-5 fw-bold mb-3">Recursos Poderosos</h2>
            <p className="lead text-muted">
              Tudo que você precisa para vender mais pelo WhatsApp
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: <Phone size={24} />,
                title: "Multi-Dispositivos",
                description:
                  "Conecte múltiplos dispositivos e gerencie todas suas conversas em um só lugar.",
              },
              {
                icon: <ShoppingBag size={24} />,
                title: "Catálogo Digital",
                description:
                  "Crie um catálogo profissional com seus produtos e compartilhe facilmente.",
              },
              {
                icon: <ChartBar size={24} />,
                title: "Relatórios Detalhados",
                description:
                  "Acompanhe suas vendas com relatórios e estatísticas em tempo real.",
              },
              {
                icon: <Lightning size={24} />,
                title: "Resposta Rápida",
                description:
                  "Atenda seus clientes instantaneamente com respostas automáticas inteligentes.",
              },
              {
                icon: <Shield size={24} />,
                title: "100% Seguro",
                description:
                  "Suas conversas e dados são criptografados e protegidos.",
              },
              {
                icon: <Users size={24} />,
                title: "Suporte Premium",
                description:
                  "Equipe dedicada para ajudar você em qualquer momento.",
              },
            ].map((feature, i) => (
              <div className="col-md-6 col-lg-4" key={i}>
                <div className="card h-100 border-0 shadow-sm hover-scale">
                  <div className="card-body p-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-3 p-3 mb-3">
                      <span className="text-primary">{feature.icon}</span>
                    </div>
                    <h4 className="mb-3">{feature.title}</h4>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="position-relative">
                <div className="position-absolute top-0 start-50 translate-middle-x">
                  <div
                    className="bg-primary rounded-circle"
                    style={{
                      width: "200px",
                      height: "200px",
                      filter: "blur(60px)",
                      opacity: "0.2",
                    }}
                  ></div>
                </div>
                <div className="card border-0 shadow-lg overflow-hidden">
                  <div className="card-header bg-white d-flex align-items-center p-2 border-0">
                    <div className="d-flex gap-1 me-2">
                      <div
                        className="rounded-circle bg-danger"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                      <div
                        className="rounded-circle bg-warning"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                      <div
                        className="rounded-circle bg-success"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                    </div>
                    <div className="small text-center w-100 text-secondary">
                      Venda Mais - Catálogo
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <div className="row g-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div className="col-6" key={i}>
                          <div className="card card-status-primary p-3 h-100">
                            <div
                              className="bg-light rounded mb-2 d-flex align-items-center justify-content-center"
                              style={{ height: "100px" }}
                            >
                              <Clock
                                size={32}
                                className="text-secondary opacity-25"
                              />
                            </div>
                            <div className="small fw-medium">Serviço {i}</div>
                            <div className="small text-secondary">
                              {30 + (i * 15)}min • R$ {(i * 59.9).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
                Benefícios
              </span>
              <h2 className="display-5 fw-bold mb-4">
                Por que escolher o Venda Mais?
              </h2>

              <div className="d-flex align-items-start mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-4">
                  <Lightning size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">Resposta Rápida</h4>
                  <p className="text-muted mb-0">
                    Atenda seus clientes instantaneamente com respostas
                    automáticas inteligentes.
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start mb-4">
                <div className="bg-success bg-opacity-10 p-3 rounded-3 me-4">
                  <Shield size={24} className="text-success" />
                </div>
                <div>
                  <h4 className="mb-2">100% Seguro</h4>
                  <p className="text-muted mb-0">
                    Suas conversas e dados são criptografados e protegidos com
                    as mais avançadas tecnologias de segurança.
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="bg-info bg-opacity-10 p-3 rounded-3 me-4">
                  <Users size={24} className="text-info" />
                </div>
                <div>
                  <h4 className="mb-2">Suporte Premium</h4>
                  <p className="text-muted mb-0">
                    Equipe dedicada para ajudar você em qualquer momento, 7 dias
                    por semana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">
              Planos
            </span>
            <h2 className="display-5 fw-bold mb-3">
              Planos que Cabem no seu Bolso
            </h2>
            <p className="lead text-muted">
              Escolha o plano ideal para o seu negócio
            </p>
          </div>

          <div className="mb-4">
            <ul className="nav nav-pills justify-content-center" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "monthly" ? "active" : ""}`}
                  onClick={() => setActiveTab("monthly")}
                >
                  Mensal
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "yearly" ? "active" : ""}`}
                  onClick={() => setActiveTab("yearly")}
                >
                  Anual (2 meses grátis)
                </button>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div
              className={`tab-pane fade ${activeTab === "monthly" ? "show active" : ""}`}
            >
              <div className="row g-4 justify-content-center">
                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="text-center mb-4">
                        <h4>Básico</h4>
                        <div className="display-6 fw-bold mb-2">R$97/mês</div>
                        <p className="text-muted">Para pequenos negócios</p>
                      </div>
                      <ul className="list-unstyled mb-4">
                        {[
                          "1 Dispositivo",
                          "100 Produtos",
                          "Catálogo Digital",
                          "Relatórios Básicos",
                        ].map((feature, i) => (
                          <li
                            className="d-flex align-items-center mb-2"
                            key={i}
                          >
                            <Check
                              size={18}
                              className="text-success me-2"
                              weight="bold"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/signup"
                        className="btn btn-outline-primary d-block"
                      >
                        Começar Agora
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-lg border-2 border-primary position-relative">
                    <div className="position-absolute top-0 start-50 translate-middle">
                      <span className="badge bg-primary px-3 py-2">
                        Mais Popular
                      </span>
                    </div>
                    <div className="card-body p-4">
                      <div className="text-center mb-4">
                        <h4>Profissional</h4>
                        <div className="display-6 fw-bold mb-2">R$197/mês</div>
                        <p className="text-muted">
                          Para negócios em crescimento
                        </p>
                      </div>
                      <ul className="list-unstyled mb-4">
                        {[
                          "3 Dispositivos",
                          "500 Produtos",
                          "Catálogo Personalizado",
                          "Relatórios Avançados",
                          "Suporte Prioritário",
                          "API de Integração",
                        ].map((feature, i) => (
                          <li
                            className="d-flex align-items-center mb-2"
                            key={i}
                          >
                            <Check
                              size={18}
                              className="text-success me-2"
                              weight="bold"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/signup" className="btn btn-primary d-block">
                        Começar Agora
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`tab-pane fade ${activeTab === "yearly" ? "show active" : ""}`}
            >
              <div className="row g-4 justify-content-center">
                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="text-center mb-4">
                        <h4>Básico</h4>
                        <div className="display-6 fw-bold mb-2">R$77/mês</div>
                        <p className="text-muted">Cobrado anualmente (R$924)</p>
                      </div>
                      <ul className="list-unstyled mb-4">
                        {[
                          "1 Dispositivo",
                          "100 Produtos",
                          "Catálogo Digital",
                          "Relatórios Básicos",
                        ].map((feature, i) => (
                          <li
                            className="d-flex align-items-center mb-2"
                            key={i}
                          >
                            <Check
                              size={18}
                              className="text-success me-2"
                              weight="bold"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/signup"
                        className="btn btn-outline-primary d-block"
                      >
                        Começar Agora
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-lg border-2 border-primary position-relative">
                    <div className="position-absolute top-0 start-50 translate-middle">
                      <span className="badge bg-primary px-3 py-2">
                        Mais Popular
                      </span>
                    </div>
                    <div className="card-body p-4">
                      <div className="text-center mb-4">
                        <h4>Profissional</h4>
                        <div className="display-6 fw-bold mb-2">R$157/mês</div>
                        <p className="text-muted">
                          Cobrado anualmente (R$1.884)
                        </p>
                      </div>
                      <ul className="list-unstyled mb-4">
                        {[
                          "3 Dispositivos",
                          "500 Produtos",
                          "Catálogo Personalizado",
                          "Relatórios Avançados",
                          "Suporte Prioritário",
                          "API de Integração",
                        ].map((feature, i) => (
                          <li
                            className="d-flex align-items-center mb-2"
                            key={i}
                          >
                            <Check
                              size={18}
                              className="text-success me-2"
                              weight="bold"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/signup" className="btn btn-primary d-block">
                        Começar Agora
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-5">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <motion.h2
                className="display-5 fw-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Comece a Vender Mais Hoje!
              </motion.h2>
              <motion.p
                className="lead mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Junte-se a milhares de empresas que já aumentaram suas vendas
                com nossa plataforma.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Link href="/signup" className="btn btn-light btn-lg px-5">
                  Criar Conta Grátis{" "}
                  <Sparkle size={20} className="ms-2" weight="fill" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <h3 className="h4 mb-4">Venda Mais</h3>
              <p className="mb-4">
                Transforme seu WhatsApp em uma ferramenta de vendas profissional
                e aumente seus resultados.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="text-white opacity-75 hover-scale">
                  <span className="visually-hidden">Facebook</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                </a>
                <a href="#" className="text-white opacity-75 hover-scale">
                  <span className="visually-hidden">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                </a>
                <a href="#" className="text-white opacity-75 hover-scale">
                  <span className="visually-hidden">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="col-lg-4">
              <h3 className="h5 mb-3">Links Rápidos</h3>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a
                    href="#"
                    className="text-white opacity-75 text-decoration-none"
                  >
                    Recursos
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#"
                    className="text-white opacity-75 text-decoration-none"
                  >
                    Preços
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#"
                    className="text-white opacity-75 text-decoration-none"
                  >
                    Sobre Nós
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#"
                    className="text-white opacity-75 text-decoration-none"
                  >
                    Blog
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="#"
                    className="text-white opacity-75 text-decoration-none"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h3 className="h5 mb-3">Contato</h3>
              <ul className="list-unstyled">
                <li className="d-flex mb-2">
                  <span className="me-2">📍</span>
                  <span>Av. Paulista, 1000, São Paulo - SP</span>
                </li>
                <li className="d-flex mb-2">
                  <span className="me-2">📱</span>
                  <span>(11) 99999-9999</span>
                </li>
                <li className="d-flex mb-2">
                  <span className="me-2">✉️</span>
                  <span>contato@agenda-ai.com.br</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-top border-secondary mt-4 pt-4 text-center">
            <p className="small text-white opacity-75 mb-0">
              &copy; {new Date().getFullYear()} Agenda AI. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
