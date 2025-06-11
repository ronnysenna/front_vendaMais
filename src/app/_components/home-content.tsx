'use client'

import Link from "next/link"
import Image from "next/image"
import {
    PhoneCall,
    ShoppingBag,
    BarChart,
    Zap,
    Shield,
    Users,
    Check
} from 'lucide-react'

interface HomeContentProps {
    isLoggedIn: boolean
}

export function HomeContent({ isLoggedIn }: HomeContentProps) {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-dark text-white py-5">
                <div className="container">
                    <div className="row align-items-center min-vh-75 py-5">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-4">
                                Transforme seu WhatsApp em uma
                                <span className="text-primary"> Máquina de Vendas</span>
                            </h1>
                            <p className="lead mb-4 text-light-emphasis">
                                Automatize seu atendimento, organize seus produtos e aumente suas vendas com nossa plataforma completa de gestão de vendas via WhatsApp.
                            </p>
                            <div className="d-flex gap-3">
                                {isLoggedIn ? (
                                    <Link
                                        href="/dashboard"
                                        className="btn btn-primary btn-lg px-4"
                                    >
                                        Acessar Painel
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/signup" className="btn btn-primary btn-lg px-4">
                                            Começar Grátis
                                        </Link>
                                        <Link href="/login" className="btn btn-outline-light btn-lg px-4">
                                            Fazer Login
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-6 mt-5 mt-lg-0">
                            <div className="position-relative">
                                <div className="position-absolute top-0 start-50 translate-middle-x">
                                    <div className="bg-primary rounded-circle" style={{ width: '250px', height: '250px', filter: 'blur(80px)', opacity: '0.3' }}></div>
                                </div>
                                <Image
                                    src="/images/logo.png"
                                    width={600}
                                    height={400}
                                    alt="Venda Mais Dashboard"
                                    className="img-fluid rounded-4 shadow-lg"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5 bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold mb-3">Recursos Poderosos</h2>
                        <p className="lead text-muted">Tudo que você precisa para vender mais pelo WhatsApp</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-3 p-3 mb-3">
                                        <PhoneCall size={24} className="text-primary" />
                                    </div>
                                    <h4 className="mb-3">Multi-Dispositivos</h4>
                                    <p className="text-muted mb-0">
                                        Conecte múltiplos dispositivos e gerencie todas suas conversas em um só lugar.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-3 p-3 mb-3">
                                        <ShoppingBag size={24} className="text-success" />
                                    </div>
                                    <h4 className="mb-3">Catálogo Digital</h4>
                                    <p className="text-muted mb-0">
                                        Crie um catálogo profissional com seus produtos e compartilhe facilmente.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-3 p-3 mb-3">
                                        <BarChart size={24} className="text-info" />
                                    </div>
                                    <h4 className="mb-3">Relatórios Detalhados</h4>
                                    <p className="text-muted mb-0">
                                        Acompanhe suas vendas com relatórios e estatísticas em tempo real.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-5">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <Image
                                src="/images/logo.png"
                                width={600}
                                height={400}
                                alt="Benefícios do Venda Mais"
                                className="img-fluid rounded-4 shadow-lg"
                            />
                        </div>
                        <div className="col-lg-6">
                            <h2 className="display-5 fw-bold mb-4">Por que escolher o Venda Mais?</h2>
                            <div className="d-flex align-items-start mb-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-4">
                                    <Zap size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h4 className="mb-2">Resposta Rápida</h4>
                                    <p className="text-muted mb-0">
                                        Atenda seus clientes instantaneamente com respostas automáticas inteligentes.
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
                                        Suas conversas e dados são criptografados e protegidos.
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
                                        Equipe dedicada para ajudar você em qualquer momento.
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
                        <h2 className="display-5 fw-bold mb-3">Planos que Cabem no seu Bolso</h2>
                        <p className="lead text-muted">Escolha o plano ideal para o seu negócio</p>
                    </div>

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
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>1 Dispositivo</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>100 Produtos</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>Catálogo Digital</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>Relatórios Básicos</span>
                                        </li>
                                    </ul>
                                    <Link href="/signup" className="btn btn-outline-primary d-block">
                                        Começar Agora
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-4">
                            <div className="card h-100 shadow-lg border-2 border-primary position-relative">
                                <div className="position-absolute top-0 start-50 translate-middle">
                                    <span className="badge bg-primary px-3 py-2">Mais Popular</span>
                                </div>
                                <div className="card-body p-4">
                                    <div className="text-center mb-4">
                                        <h4>Profissional</h4>
                                        <div className="display-6 fw-bold mb-2">R$197/mês</div>
                                        <p className="text-muted">Para negócios em crescimento</p>
                                    </div>
                                    <ul className="list-unstyled mb-4">
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>3 Dispositivos</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>500 Produtos</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>Catálogo Personalizado</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>Relatórios Avançados</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>Suporte Prioritário</span>
                                        </li>
                                        <li className="d-flex align-items-center mb-2">
                                            <Check size={18} className="text-success me-2" />
                                            <span>API de Integração</span>
                                        </li>
                                    </ul>
                                    <Link href="/signup" className="btn btn-primary d-block">
                                        Começar Agora
                                    </Link>
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
                            <h2 className="display-5 fw-bold mb-4">Comece a Vender Mais Hoje!</h2>
                            <p className="lead mb-4">
                                Junte-se a milhares de empresas que já aumentaram suas vendas com nossa plataforma.
                            </p>
                            <Link
                                href="/signup"
                                className="btn btn-light btn-lg px-5"
                            >
                                Criar Conta Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
