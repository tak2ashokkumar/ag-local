import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { EchartsxModule } from 'echarts-for-angular';
import { UnityAiLifecycleRoutingModule } from './unity-ai-lifecycle-routing.module';
import { GpuOrchestrationComponent } from './gpu-orchestration/gpu-orchestration.component';
import { GpuOrchestrationCrudComponent } from './gpu-orchestration/gpu-orchestration-crud/gpu-orchestration-crud.component';
import { WorkloadManagementComponent } from './workload-management/workload-management.component';
import { UnityAiLifecycleStorageComponent } from './unity-ai-lifecycle-storage/unity-ai-lifecycle-storage.component';
import { PreconfiguredAiStackComponent } from './preconfigured-ai-stack/preconfigured-ai-stack.component';

@NgModule({
  declarations: [
    GpuOrchestrationComponent,
    GpuOrchestrationCrudComponent,
    WorkloadManagementComponent,
    UnityAiLifecycleStorageComponent,
    PreconfiguredAiStackComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EchartsxModule,
    UnityAiLifecycleRoutingModule
  ]
})
export class UnityAiLifecycleModule { }
