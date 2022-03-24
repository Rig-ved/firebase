import { Component, OnInit } from '@angular/core';
import { ProgressType, Task } from './task/task.model';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { TaskDialogResult } from './task-dialog/task-dialog.model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import * as moment from 'moment';

const getObservable = (collection: AngularFirestoreCollection<Task>) => {
  const subject = new BehaviorSubject<Partial<Task>[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Task[]) => {
    subject.next(val);
  });
  return subject;

};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title: string="kanbanFire";
  constructor(private dialog: MatDialog,private store:AngularFirestore) {

  }
  ngOnInit(): void {
    const time = moment.utc();
    alert("Hey new deployed app");
  }

  ProgressEnum: typeof ProgressType = ProgressType
  todo = getObservable(this.store.collection(ProgressType.TODO)) as Observable<Partial<Task>[]>;
  inProgress = getObservable(this.store.collection(ProgressType.INPROGRESS)) as Observable<Partial<Task>[]>;
  done = getObservable(this.store.collection(ProgressType.DONE)) as Observable<Partial<Task>[]>;

  editTask(list: ProgressType.DONE | ProgressType.TODO | ProgressType.INPROGRESS, task: Partial<Task>): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        if (result.delete) {
          this.store.collection(list).doc(task.id).delete();
        } else {
          this.store.collection(list).doc(task.id).update(task);
        }
      });
  }
  drop(event: CdkDragDrop<Partial<Task>[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        if (Boolean(Object.keys(result.task).length === 0)) {
          return;
        }
        this.store.collection(ProgressType.TODO).add(result.task)
      });
  }
}
