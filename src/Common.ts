import {Toolkit} from "./Toolkit";
import {BaseEnity, BaseListener} from "./BaseEntity";
import * as _ from "lodash";

export interface BaseModelListener extends BaseListener{
	
	selectionChanged?();
	
	entityRemoved?();
}

/**
 * @author Dylan Vorster
 */
export class BaseModel extends BaseEnity<BaseModelListener>{
	
	selected: boolean;
	
	constructor(){
		super();
		this.id = Toolkit.UID();
		this.selected = false;
	}
	
	public getID(): string{
		return this.id
	}
	
	public isSelected(): boolean{
		return this.selected;
	}
	
	public setSelected(selected: boolean){
		this.selected = selected;
		this.itterateListeners((listener) => {
			if(listener.selectionChanged){
				listener.selectionChanged();
			}
		});
	}
	
	remove(){
		console.log("removing: ",this);
		this.itterateListeners((listener) => {
			if(listener.entityRemoved){
				listener.entityRemoved();
			}
		});
	}
}

export class PointModel extends BaseModel{
	
	x:number;
	y:number;
	link: LinkModel;
	
	constructor(link: LinkModel,points: {x:number,y: number}){
		super();
		this.x = points.x;
		this.y = points.y;
		this.link = link;
	}
	
	remove(){
		super.remove();
		
		//clear references
		if (this.link){
			this.link.removePoint(this);
		}
	}
	
	updateLocation(points: {x:number,y: number}){
		this.x = points.x;
		this.y = points.y;
	}
	
	getX():number{
		return this.x;
	}
	
	getY():number{
		return this.y;
	}
	
	getLink(): LinkModel{
		return this.link;
	}
}

export class LinkModel extends BaseModel{
	
	linkType: string;
	sourcePort: PortModel|null;
	targetPort: PortModel|null;
	points: PointModel[];
	extras: {};
	
	constructor(){
		super();
		this.linkType = 'default';
		this.points = [
			new PointModel(this,{x: 0,y: 0}),
			new PointModel(this,{x: 0,y: 0}),
		];
		this.extras = {};
		this.sourcePort = null;
		this.targetPort = null;
	}
	
	remove(){
		super.remove();
		if (this.sourcePort){
			this.sourcePort.removeLink(this);
		}
		if (this.targetPort){
			this.targetPort.removeLink(this);
		}
	}
	
	isLastPoint(point: PointModel){
		var index = this.getPointIndex(point);
		return index === this.points.length-1;
	}
	
	getPointIndex(point: PointModel){
		return this.points.indexOf(point);
	}
	
	getPointModel(id: string): PointModel|null{
		for (var i = 0; i < this.points.length;i++){
			if (this.points[i].id === id){
				return this.points[i];
			}
		}
		return null;
	}
	
	getFirstPoint(): PointModel{
		return this.points[0];
	}
	
	getLastPoint(): PointModel{
		return this.points[this.points.length-1];
	}
	
	setSourcePort(port: PortModel){
		port.addLink(this);
		this.sourcePort = port;
	}
	
	getSourcePort(): PortModel{
		return this.sourcePort;
	}
	
	getTargetPort(): PortModel{
		return this.targetPort;
	}
	
	setTargetPort(port: PortModel){
		port.addLink(this);
		this.targetPort = port;
	}
	
	getPoints(): PointModel[]{
		return this.points;
	}
	
	setPoints(points: PointModel[]){
		this.points = points;
	}
	
	removePoint(pointModel: PointModel){
		this.points.splice(this.getPointIndex(pointModel),1);
	}
	
	addPoint(pointModel:PointModel,index = 1){
		this.points.splice(index,0,pointModel);
	}
	
	getType(): string{
		return this.linkType;
	}
}

export class PortModel extends BaseModel{
	
	name: string;
	parentNode: NodeModel;
	links: {[id: string]: LinkModel};
	
	constructor(name: string){
		super();
		this.name = name;
		this.links = {};
		this.parentNode = null;
	}
	
	getName(): string{
		return this.name;
	}
	
	getParent(): NodeModel{
		return this.parentNode;
	}
	
	setParentNode(node: NodeModel){
		this.parentNode = node;
	}
	
	removeLink(link: LinkModel){
		delete this.links[link.getID()];
	}
	
	addLink(link: LinkModel){
		this.links[link.getID()] = link;
	}
	
	getLinks(): {[id: string]: LinkModel}{
		return this.links;
	}
}

export class NodeModel extends BaseModel{
	
	nodeType: string;
	canDelete: boolean;
	x: number;
	y: number;
	extras: {};
	ports:  {[s: string]:PortModel};
	
	constructor(){
		super();
		this.canDelete = true;
		this.nodeType = "default";
		this.x = 0;
		this.y = 0;
		this.extras = {};
		this.ports = {};
	}
	
	remove(){
		super.remove();
		for (var i in this.ports){
			_.forEach(this.ports[i].getLinks(),(link) => {
				link.remove();
			});
		}
	}
	
	getPort(name: string): PortModel | null{
		return this.ports[name];
	}
	
	getPorts(): {[s: string]:PortModel}{
		return this.ports;
	}
	
	removePort(port: PortModel){
		//clear the parent node reference
		if(this.ports[port.name]){
			this.ports[port.name].setParentNode(null);
			delete this.ports[port.name];
		}
	}
	
	addPort(port: PortModel): PortModel{
		port.setParentNode(this);
		this.ports[port.name] = port;
		return port;
	}
	
	getType(): string{
		return this.nodeType;
	}
}