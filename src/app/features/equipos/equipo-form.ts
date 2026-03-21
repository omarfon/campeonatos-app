import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { CompetenciaService } from '../../core/services/competencia.service';
import { DisciplinaService } from '../../core/services/disciplina.service';
import { TipoParticipante, EstadoElegibilidad } from '../../core/models/equipo.model';

@Component({
  selector: 'app-equipo-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-900">{{ isEdit() ? 'Editar' : 'Nuevo' }} Equipo</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">
        <!-- Datos del equipo -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-slate-900">Datos del equipo</h3>

          <div>
            <label for="nombre" class="block text-sm font-medium text-slate-700 mb-1">Nombre del equipo</label>
            <input id="nombre" formControlName="nombre" type="text"
              class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="competencia" class="block text-sm font-medium text-slate-700 mb-1">Competencia</label>
              <select id="competencia" formControlName="competenciaId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar...</option>
                @for (camp of competencias(); track camp.id) {
                  <option [value]="camp.id">{{ camp.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label for="disciplina" class="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
              <select id="disciplina" formControlName="disciplinaId"
                class="w-full rounded-lg border-slate-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar...</option>
                @for (disc of disciplinas(); track disc.id) {
                  <option [value]="disc.id">{{ disc.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Participantes -->
        @if (isEdit()) {
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">Participantes</h3>
              <button type="button" (click)="addParticipante()"
                class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">+ Agregar participante</button>
            </div>

            <div formArrayName="participantes" class="space-y-3">
              @for (p of participantesArray.controls; track $index) {
                <div [formGroupName]="$index" class="border rounded-lg p-4 bg-slate-50">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input formControlName="nombre" placeholder="Nombre"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    <input formControlName="apellido" placeholder="Apellido"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    <input formControlName="dni" placeholder="DNI"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    <select formControlName="tipo"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500">
                      <option value="socio">Socio</option>
                      <option value="invitado">Invitado</option>
                    </select>
                    <input formControlName="numeroCamiseta" placeholder="N° Camiseta" type="number"
                      class="rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                    <div class="flex gap-2 items-center">
                      <input formControlName="posicion" placeholder="Posición"
                        class="flex-1 rounded border-slate-300 border px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                      <button type="button" (click)="removeParticipante($index)"
                        class="text-red-500 hover:text-red-700 px-2" aria-label="Eliminar participante">✕</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="flex gap-3">
          <button type="submit" [disabled]="form.invalid"
            class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ isEdit() ? 'Actualizar' : 'Crear' }}
          </button>
          <button type="button" (click)="cancelar()"
            class="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EquipoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly equipoService = inject(EquipoService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly disciplinaService = inject(DisciplinaService);

  protected readonly isEdit = signal(false);
  protected readonly competencias = this.competenciaService.items;
  protected readonly disciplinas = this.disciplinaService.items;
  private editId = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    competenciaId: ['', Validators.required],
    disciplinaId: ['', Validators.required],
    participantes: this.fb.array<FormGroup>([]),
  });

  get participantesArray(): FormArray<FormGroup> {
    return this.form.controls.participantes;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const equipo = this.equipoService.getEquipoById(id);
      if (equipo) {
        this.isEdit.set(true);
        this.editId = id;
        this.form.patchValue(equipo);
        equipo.participantes.forEach((p) => {
          this.participantesArray.push(
            this.fb.group({
              nombre: [p.nombre],
              apellido: [p.apellido],
              dni: [p.dni],
              tipo: [p.tipo],
              numeroCamiseta: [p.numeroCamiseta],
              posicion: [p.posicion],
              elegibilidad: [p.elegibilidad],
              fechaRegistro: [p.fechaRegistro],
            })
          );
        });
      }
    }
  }

  protected addParticipante(): void {
    this.participantesArray.push(
      this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        dni: ['', Validators.required],
        tipo: ['socio' as TipoParticipante],
        numeroCamiseta: [null as number | null],
        posicion: [''],
        elegibilidad: ['elegible' as EstadoElegibilidad],
        fechaRegistro: [new Date().toISOString().split('T')[0]],
      })
    );
  }

  protected removeParticipante(index: number): void {
    this.participantesArray.removeAt(index);
  }

  protected guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    if (this.isEdit()) {
      this.equipoService.updateEquipo(this.editId, {
        nombre: value.nombre,
        competenciaId: value.competenciaId,
        disciplinaId: value.disciplinaId,
      });
    } else {
      this.equipoService.createEquipo({
        nombre: value.nombre,
        competenciaId: value.competenciaId,
        disciplinaId: value.disciplinaId,
      });
    }
    this.router.navigate(['/maestros/equipos']);
  }

  protected cancelar(): void {
    this.router.navigate(['/maestros/equipos']);
  }
}
