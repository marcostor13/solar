# Solución para Paper.js - API Moderna (v0.12+)

## Problema
El código está intentando usar `paper.setup()` o `PaperScope` directamente, pero en Paper.js v0.12+ la API cambió.

## Solución

### API Antigua (NO funciona en v0.12+):
```typescript
// ❌ Esto NO funciona en Paper.js v0.12+
paper.setup(canvas);
// o
const scope = new PaperScope();
scope.setup(canvas);
```

### API Moderna (v0.12+):
```typescript
// ✅ Opción 1: Usar paper.default (PaperScope por defecto)
import * as paper from 'paper';

async loadPaperJs() {
  // Cargar Paper.js dinámicamente
  const paperModule = await import('paper');
  const paper = paperModule.default || paperModule;
  
  // Usar paper.default que es el PaperScope por defecto
  const scope = paper.default;
  
  // Configurar el canvas
  const canvas = this.canvasElement.nativeElement;
  scope.setup(canvas);
  
  // Ahora puedes usar scope.project para trabajar
  const path = new scope.Path();
  path.strokeColor = 'black';
  // ... resto del código
}

// ✅ Opción 2: Crear un nuevo PaperScope
import * as paper from 'paper';

async loadPaperJs() {
  const paperModule = await import('paper');
  const paper = paperModule.default || paperModule;
  
  // Crear un nuevo scope
  const scope = new paper.PaperScope();
  
  // Configurar el canvas
  const canvas = this.canvasElement.nativeElement;
  scope.setup(canvas);
  
  // Activar el scope
  scope.activate();
  
  // Trabajar con el scope
  const path = new scope.Path();
  // ... resto del código
}
```

## Ejemplo Completo para Angular

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as paper from 'paper';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss']
})
export class DrawingCanvasComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  private paperScope: paper.PaperScope | null = null;

  async ngAfterViewInit() {
    await this.initializePaper();
  }

  private async initializePaper() {
    try {
      // Cargar Paper.js dinámicamente
      const paperModule = await import('paper');
      const paper = paperModule.default || paperModule;
      
      console.log('Paper.js cargado correctamente');
      console.log('Propiedades disponibles:', Object.keys(paper));
      
      // Usar paper.default que es el PaperScope por defecto
      this.paperScope = paper.default;
      
      if (!this.paperScope) {
        throw new Error('PaperScope no disponible');
      }
      
      // Configurar el canvas
      const canvas = this.canvasElement.nativeElement;
      this.paperScope.setup(canvas);
      
      console.log('Paper.js inicializado correctamente');
      
      // Ejemplo de uso
      this.drawExample();
      
    } catch (error) {
      console.error('Error al inicializar Paper.js:', error);
    }
  }

  private drawExample() {
    if (!this.paperScope || !this.paperScope.project) {
      return;
    }
    
    // Crear un path usando el scope
    const path = new this.paperScope.Path();
    path.strokeColor = new this.paperScope.Color('black');
    path.add(new this.paperScope.Point(50, 50));
    path.add(new this.paperScope.Point(150, 150));
    
    // Dibujar en el canvas
    this.paperScope.view.draw();
  }
}
```

## Puntos Clave:

1. **`paper.default`** es el `PaperScope` por defecto en Paper.js v0.12+
2. **`paper.PaperScope`** es la clase para crear nuevos scopes
3. **`scope.setup(canvas)`** es el método correcto para configurar el canvas
4. **`scope.activate()`** activa el scope si creaste uno nuevo
5. Usa **`scope.Path`**, **`scope.Point`**, etc. en lugar de `paper.Path` directamente

## Verificación

Si ves en la consola:
```
Propiedades disponibles: ['settings', 'project', 'projects', 'tools', '_id', 'default']
default es: PaperScope2 {...}
```

Entonces `paper.default` es tu `PaperScope` y debes usarlo así:
```typescript
const scope = paper.default;
scope.setup(canvas);
```





