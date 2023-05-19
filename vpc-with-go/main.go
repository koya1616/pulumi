package main

import (
    "github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ec2"
    "github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {
        vpc, err := ec2.NewVpc(ctx, "my-vpc", &ec2.VpcArgs{
            CidrBlock: pulumi.String("10.0.0.0/16"),
        })
        if err != nil {
            return err
        }

        routeTable, err := ec2.NewRouteTable(ctx, "my-route-table", &ec2.RouteTableArgs{
            VpcId: vpc.ID(),
        })
        if err != nil {
            return err
        }

        subnet1, err := ec2.NewSubnet(ctx, "subnet1", &ec2.SubnetArgs{
            CidrBlock: pulumi.String("10.0.1.0/24"),
            VpcId:     vpc.ID(),
        })
        if err != nil {
            return err
        }

        subnet2, err := ec2.NewSubnet(ctx, "subnet2", &ec2.SubnetArgs{
            CidrBlock: pulumi.String("10.0.2.0/24"),
            VpcId:     vpc.ID(),
        })
        if err != nil {
            return err
        }

        _, err = ec2.NewRouteTableAssociation(ctx, "subnet1-association", &ec2.RouteTableAssociationArgs{
            SubnetId:     subnet1.ID(),
            RouteTableId: routeTable.ID(),
        })
        if err != nil {
            return err
        }

        _, err = ec2.NewRouteTableAssociation(ctx, "subnet2-association", &ec2.RouteTableAssociationArgs{
            SubnetId:     subnet2.ID(),
            RouteTableId: routeTable.ID(),
        })
        if err != nil {
            return err
        }

        ctx.Export("VpcId", vpc.ID())
        ctx.Export("RouteTableId", routeTable.ID())
        ctx.Export("Subnet1Id", subnet1.ID())
        ctx.Export("Subnet2Id", subnet2.ID())

        return nil
    })
}
