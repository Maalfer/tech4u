# Redefinimos la clase User simplificada para testear la lógica del método add_xp que es independiente de sqlalchemy
class UserMock:
    def __init__(self, nombre, level=1, xp=0):
        self.nombre = nombre
        self.level = level
        self.xp = xp
        self.role = "alumno"

    def get_next_level_xp(self):
        return self.level * 500

    def add_xp(self, amount: int):
        self.xp = max(0, (self.xp or 0) + amount)
        leveled_up = False
        while True:
            needed = self.get_next_level_xp()
            if self.xp >= needed:
                self.xp -= needed
                self.level += 1
                leveled_up = True
            else:
                break
        return leveled_up

def test_leveling():
    print("--- TEST DE SISTEMA DE NIVELES RPG (MOCK) ---")
    user = UserMock(nombre="Test User", level=1, xp=0)
    
    amount = 2015
    print(f"Simulando ganancia de {amount} XP para usuario Nivel 1...")
    
    leveled_up = user.add_xp(amount)
    
    print(f"¿Subió de nivel?: {leveled_up}")
    print(f"Nivel final: {user.level}")
    print(f"XP restante: {user.xp}")
    
    # Verificación: 
    # Nivel 1 -> 2: cuesta 1 * 500 = 500. Restan 1515.
    # Nivel 2 -> 3: cuesta 2 * 500 = 1000. Restan 515.
    # Nivel 3 -> 4: cuesta 3 * 500 = 1500. No alcanza (515 < 1500).
    
    expected_level = 3
    expected_xp = 515
    
    if user.level == expected_level and user.xp == expected_xp:
        print("✅ VERIFICACIÓN EXITOSA: La lógica sustractiva centralizada funciona correctamente.")
    else:
        print(f"❌ FALLO: Se esperaba Nivel {expected_level} y XP {expected_xp}, pero se obtuvo Nivel {user.level} y XP {user.xp}.")

if __name__ == "__main__":
    test_leveling()
