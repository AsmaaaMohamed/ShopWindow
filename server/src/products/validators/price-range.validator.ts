import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Applied to `maxPrice`. Fails only when both minPrice and maxPrice are
 * present and maxPrice < minPrice — an invalid range. Either field being
 * absent is fine (open-ended range).
 */
export function IsGreaterThanOrEqualTo(
  relatedProperty: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThanOrEqualTo',
      target: object.constructor,
      propertyName,
      constraints: [relatedProperty],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

          if (value === undefined || relatedValue === undefined) {
            return true;
          }

          return typeof value === 'number' && typeof relatedValue === 'number'
            ? value >= relatedValue
            : true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as string[];
          return `${args.property} must be greater than or equal to ${relatedPropertyName}`;
        },
      },
    });
  };
}