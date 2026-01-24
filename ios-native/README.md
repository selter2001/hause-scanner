# Natywny Plugin RoomPlan dla Capacitor

Ten folder zawiera natywny kod Swift do integracji z Apple RoomPlan API.

## Wymagania

- iOS 16.0+
- iPhone z czujnikiem LiDAR (iPhone 12 Pro, 13 Pro, 14 Pro, 15 Pro)
- Xcode 14+

## Instalacja

Po wyeksportowaniu projektu na GitHub i dodaniu platformy iOS:

1. Otwórz projekt iOS w Xcode:
   ```bash
   npx cap open ios
   ```

2. Skopiuj plik `RoomPlanPlugin.swift` do folderu `App/App/`

3. Dodaj plugin do `AppDelegate.swift`:
   ```swift
   import RoomPlan
   
   // W metodzie application(_:didFinishLaunchingWithOptions:):
   bridge?.registerPlugin(RoomPlanPlugin.self)
   ```

4. Dodaj uprawnienia do `Info.plist`:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>Aplikacja potrzebuje dostępu do kamery do skanowania pomieszczeń</string>
   ```

5. Dodaj framework RoomPlan:
   - Project Settings → General → Frameworks, Libraries, and Embedded Content
   - Dodaj `RoomPlan.framework`

## Użycie w JavaScript

```typescript
import { Plugins } from '@capacitor/core';

const { RoomPlanPlugin } = Plugins;

// Sprawdź wsparcie
const { supported } = await RoomPlanPlugin.isSupported();

// Rozpocznij skanowanie
await RoomPlanPlugin.startScan();

// Nasłuchuj zakończenia
RoomPlanPlugin.addListener('scanComplete', (data) => {
  console.log('Wykryto ścian:', data.wallCount);
});

// Pobierz wyniki
const results = await RoomPlanPlugin.getResults();
```
