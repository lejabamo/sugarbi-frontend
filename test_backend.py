#!/usr/bin/env python3
"""
Script simple para probar si el backend está corriendo
"""

import requests

def test_backend():
    try:
        response = requests.get("http://localhost:5001/")
        print(f"✅ Backend corriendo - Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Backend no disponible: {e}")
        return False

if __name__ == "__main__":
    test_backend()
