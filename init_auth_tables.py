#!/usr/bin/env python3
"""
Script para inicializar las tablas de autenticación en la base de datos SugarBI
"""

import sys
import os
from pathlib import Path
import configparser
from datetime import datetime, timedelta

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

from auth.models import db, User, Role, SessionToken, AuditLog
from auth.init_db import init_db

def create_default_roles():
    """Crear roles por defecto"""
    print("🔐 Creando roles por defecto...")
    
    # Rol de administrador
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        admin_role = Role(
            name='admin',
            description='Administrador del sistema con acceso completo',
            permissions=['*']  # Todos los permisos
        )
        db.session.add(admin_role)
        print("✅ Rol 'admin' creado")
    
    # Rol de analista
    analyst_role = Role.query.filter_by(name='analyst').first()
    if not analyst_role:
        analyst_role = Role(
            name='analyst',
            description='Analista con acceso a consultas y visualizaciones',
            permissions=['analytics.read', 'dashboard.read', 'chatbot.use']
        )
        db.session.add(analyst_role)
        print("✅ Rol 'analyst' creado")
    
    # Rol de usuario básico
    user_role = Role.query.filter_by(name='user').first()
    if not user_role:
        user_role = Role(
            name='user',
            description='Usuario básico con acceso limitado',
            permissions=['dashboard.read']
        )
        db.session.add(user_role)
        print("✅ Rol 'user' creado")
    
    db.session.commit()
    return admin_role, analyst_role, user_role

def create_default_users(admin_role, analyst_role, user_role):
    """Crear usuarios por defecto"""
    print("👤 Creando usuarios por defecto...")
    
    # Usuario administrador
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@sugarbi.com',
            first_name='Administrador',
            last_name='Sistema',
            is_active=True,
            is_admin=True,
            role_id=admin_role.id
        )
        admin_user.set_password('admin123')  # Cambiar en producción
        db.session.add(admin_user)
        print("✅ Usuario 'admin' creado (password: admin123)")
    
    # Usuario analista
    analyst_user = User.query.filter_by(username='analyst').first()
    if not analyst_user:
        analyst_user = User(
            username='analyst',
            email='analyst@sugarbi.com',
            first_name='Analista',
            last_name='SugarBI',
            is_active=True,
            is_admin=False,
            role_id=analyst_role.id
        )
        analyst_user.set_password('analyst123')  # Cambiar en producción
        db.session.add(analyst_user)
        print("✅ Usuario 'analyst' creado (password: analyst123)")
    
    # Usuario demo
    demo_user = User.query.filter_by(username='demo').first()
    if not demo_user:
        demo_user = User(
            username='demo',
            email='demo@sugarbi.com',
            first_name='Usuario',
            last_name='Demo',
            is_active=True,
            is_admin=False,
            role_id=user_role.id
        )
        demo_user.set_password('demo123')  # Cambiar en producción
        db.session.add(demo_user)
        print("✅ Usuario 'demo' creado (password: demo123)")
    
    db.session.commit()
    return admin_user, analyst_user, demo_user

def create_audit_logs():
    """Crear algunos logs de auditoría de ejemplo"""
    print("📝 Creando logs de auditoría iniciales...")
    
    # Log de inicialización del sistema
    init_log = AuditLog(
        user_id=None,  # Sistema
        action='system_init',
        resource='database',
        details={'message': 'Sistema de autenticación inicializado'},
        ip_address='127.0.0.1',
        user_agent='SugarBI-Init-Script',
        timestamp=datetime.utcnow()
    )
    db.session.add(init_log)
    
    db.session.commit()
    print("✅ Logs de auditoría creados")

def main():
    """Función principal"""
    print("🚀 Inicializando sistema de autenticación SugarBI...")
    print("=" * 50)
    
    try:
        # Inicializar la base de datos
        print("📊 Conectando a la base de datos...")
        init_db()
        print("✅ Conexión establecida")
        
        # Crear roles
        admin_role, analyst_role, user_role = create_default_roles()
        
        # Crear usuarios
        admin_user, analyst_user, demo_user = create_default_users(
            admin_role, analyst_role, user_role
        )
        
        # Crear logs de auditoría
        create_audit_logs()
        
        print("=" * 50)
        print("🎉 ¡Sistema de autenticación inicializado exitosamente!")
        print("\n📋 Usuarios creados:")
        print("   👑 admin / admin123 (Administrador)")
        print("   📊 analyst / analyst123 (Analista)")
        print("   👤 demo / demo123 (Usuario básico)")
        print("\n⚠️  IMPORTANTE: Cambia las contraseñas en producción!")
        
    except Exception as e:
        print(f"❌ Error durante la inicialización: {str(e)}")
        db.session.rollback()
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())