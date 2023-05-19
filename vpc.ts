import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const vpc = new aws.ec2.Vpc("my-vpc", {
    cidrBlock: "10.0.0.0/16",
});

const routeTable = new aws.ec2.RouteTable("my-route-table", {
    vpcId: vpc.id,
});

const subnet1 = new aws.ec2.Subnet("subnet1", {
    cidrBlock: "10.0.1.0/24",
    vpcId: vpc.id,
});

const subnet2 = new aws.ec2.Subnet("subnet2", {
    cidrBlock: "10.0.2.0/24",
    vpcId: vpc.id,
});

const subnet1Association = new aws.ec2.RouteTableAssociation("subnet1-association", {
    subnetId: subnet1.id,
    routeTableId: routeTable.id,
});

const subnet2Association = new aws.ec2.RouteTableAssociation("subnet2-association", {
    subnetId: subnet2.id,
    routeTableId: routeTable.id,
});

export const VpcId = vpc.id;
export const RouteTableId = routeTable.id;
export const Subnet1Id = subnet1.id;
export const Subnet2Id = subnet2.id;
