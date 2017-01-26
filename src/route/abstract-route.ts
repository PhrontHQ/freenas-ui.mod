import {EventDispatcherService} from '../service/event-dispatcher-service';
import {ModelDescriptorService} from '../service/model-descriptor-service';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export abstract class AbstractRoute {
    protected constructor(
        protected eventDispatcherService: EventDispatcherService,
        protected modelDescriptorService: ModelDescriptorService
    ) {}

    protected updateStackWithContext(stack: Array<any>, context: any) {
        this.popStackAtIndex(stack, context.columnIndex);
        stack.push(context);
        return stack;
    }

    protected loadObjectInColumn(stack: any, columnIndex: number, previousColumnIndex: number, pathSuffix: any, objectType: any, dataPromise: Promise<Array<any>>|Promise<any>, filter?: any): Promise<Array<any>> {
        let parentContext = stack[previousColumnIndex],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + pathSuffix
            };
        return Promise.all([
            dataPromise,
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread((objects: Array<any>|any, uiDescriptor: Object) => {
            context.object = filter ? _.find(objects, filter) : objects;
            context.userInterfaceDescriptor = uiDescriptor;
            context.objectType = objectType;

            return this.updateStackWithContext(stack, context);
        });

    }

    protected loadPropertyInColumn(stack: any, columnIndex: number, previousColumnIndex: number, pathSuffix: any, objectType: any, propertyPath: string): Promise<Array<any>> {
        let parentContext = stack[previousColumnIndex],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + pathSuffix
            };
        return Promise.all([
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread((uiDescriptor: Object) => {
            context.object = _.get(parentContext.object, propertyPath);
            context.userInterfaceDescriptor = uiDescriptor;
            context.objectType = objectType;

            return this.updateStackWithContext(stack, context);
        });
    }

    protected getObjectPathSuffix(model: any, id: string) {
        return '/' + _.kebabCase(model) + '/_/' + encodeURIComponent(_.toString(id));
    }

    private popStackAtIndex(stack: Array<any>, index: number) {
        while (stack.length > index) {
            let context = stack.pop();
            if (context) {
                this.unregisterChangeListeners(context.changeListener);
            }
        }
    }

    private unregisterChangeListeners(changeListeners: Array<Function>|Function) {
        if (changeListeners) {
            for (let listener of _.castArray(changeListeners)) {
                this.eventDispatcherService.removeEventListener((listener as any).eventName, listener);
            }
        }
    }
}
