"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  HomeIcon,
  UserIcon,
  QrCodeIcon,
  CalendarIcon,
  ClockIcon,
  ScissorsIcon,
  PlusCircleIcon,
  ChevronDown,
  ChevronUp,
  SearchIcon,
} from "lucide-react";
import { ButtonSignOut } from "./button-signout";

export function ModernSidebar({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openServicesMenu, setOpenServicesMenu] = useState(false);

  const MenuContent = () => (
    <div className="d-flex flex-column h-100">
      {/* Logo e Nome do Usuário */}
      <div className="p-4 border-bottom">
        <div className="text-center mb-3">
          <Image
            src="/images/logo.svg"
            alt="Agenda AI Logo"
            width={80}
            height={80}
            className="img-fluid"
          />
        </div>
        <div className="text-light text-center">Olá, {userName}</div>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-grow-1 p-3">
        <div className="nav flex-column nav-pills">
          <Link
            href="/dashboard"
            className="nav-link text-light d-flex align-items-center gap-2 mb-2"
          >
            <HomeIcon size={18} /> Dashboard
          </Link>

          <Link
            href="/profile"
            className="nav-link text-light d-flex align-items-center gap-2 mb-2"
          >
            <UserIcon size={18} /> Perfil
          </Link>

          <Link
            href="/qrcode"
            className="nav-link text-light d-flex align-items-center gap-2 mb-2"
          >
            <QrCodeIcon size={18} /> Gerar QR Code
          </Link>

          {/* Menu Serviços com Submenu */}
          <div className="mb-2">
            <button
              onClick={() => setOpenServicesMenu(!openServicesMenu)}
              className="nav-link text-light d-flex align-items-center justify-content-between w-100 border-0 bg-transparent"
            >
              <span className="d-flex align-items-center gap-2">
                <ScissorsIcon size={18} /> Serviços
              </span>
              {openServicesMenu ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <div className={`collapse ${openServicesMenu ? "show" : ""}`}>
              <div className="ms-4 mt-2">
                <Link
                  href="/service/catalog"
                  className="nav-link text-light d-flex align-items-center gap-2 mb-2"
                >
                  <SearchIcon size={16} /> Listar Serviços
                </Link>
                <Link
                  href="/service/addService"
                  className="nav-link text-light d-flex align-items-center gap-2"
                >
                  <PlusCircleIcon size={16} /> Adicionar Serviço
                </Link>
              </div>
            </div>
          </div>

          {/* Calendário */}
          <Link
            href="/calendar"
            className="nav-link text-light d-flex align-items-center gap-2 mb-2"
          >
            <CalendarIcon size={18} /> Calendário
          </Link>

          {/* Disponibilidade */}
          <Link
            href="/availability"
            className="nav-link text-light d-flex align-items-center gap-2 mb-2"
          >
            <ClockIcon size={18} /> Disponibilidade
          </Link>
        </div>
      </nav>

      {/* Botão Sair */}
      <div className="p-3 border-top">
        <ButtonSignOut />
      </div>
    </div>
  );

  return (
    <>
      {/* Navbar Mobile */}
      <nav className="navbar navbar-dark bg-dark fixed-top d-md-none">
        <div className="container-fluid">
          <button className="navbar-toggler" onClick={() => setIsOpen(!isOpen)}>
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Sidebar Desktop */}
      <div
        className="d-none d-md-block bg-dark"
        style={{ width: "280px", minHeight: "100vh" }}
      >
        <MenuContent />
      </div>

      {/* Sidebar Mobile */}
      <div
        className={`offcanvas offcanvas-start bg-dark text-light ${isOpen ? "show" : ""}`}
        tabIndex={-1}
        style={{ width: "280px" }}
      >
        <div className="offcanvas-header">
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setIsOpen(false)}
          ></button>
        </div>
        <div className="offcanvas-body p-0">
          <MenuContent />
        </div>
      </div>
    </>
  );
}
