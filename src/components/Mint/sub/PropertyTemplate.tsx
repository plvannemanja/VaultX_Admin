import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import PropertiesInfo from './Properties';
import { useCreateNFT } from '@/context/createNFTContext';
import {
  deleteProperty,
  getProperties,
  upsertProperty,
} from '@/services/services';

const defaultAttributes = [
  { type: 'Type', value: 'Write it here' },
  { type: 'Medium', value: 'Write it here' },
  { type: 'Support', value: 'Write it here' },
  { type: 'Dimensions (cm)', value: 'Write it here' },
  { type: 'Signature', value: 'Write it here' },
  { type: 'Authentication', value: 'Write it here' },
];

export default function PropertiesTemplate({
  addStatus,
  isSetting,
}: {
  addStatus: boolean;
  isSetting?: boolean;
}) {
  const { toast } = useToast();
  const { advancedDetails, setAdvancedDetails } = useCreateNFT();
  const [data, setData] = useState(advancedDetails.attributes);
  const [isModalOpenTemplate, setIsModalOpenTemplate] = useState(false);
  const [editableProperties, setEditableProperties] =
    useState(defaultAttributes);

  useEffect(() => {
    setAdvancedDetails({
      ...advancedDetails,
      attributes: editableProperties,
    });
  }, [editableProperties]);

  useEffect(() => {
    fetchProperties();
    if (advancedDetails.propertyTemplateId) {
    }
    setAdvancedDetails({
      ...advancedDetails,
      propertyTemplateId: 'basic',
    });
  }, []);

  const updateTemplate = (updatedProperties) => {
    let updateData = data.map((item) => {
      if (item._id !== advancedDetails.propertyTemplateId) return item;
      return {
        ...item,
        attributes: updatedProperties,
      };
    });
    setData(updateData);
  };

  const fetchProperties = async () => {
    const response = await getProperties();
    setData(response);
  };

  const handleTemplateSelect = (template) => {
    setEditableProperties(template.attributes);
    setAdvancedDetails({
      ...advancedDetails,
      propertyTemplateId: template._id || null,
    });
  };

  const handleTemplateEdit = async (editedTemplate) => {
    try {
      const response = await upsertProperty({
        id: editedTemplate._id,
        name: editedTemplate.name,
        attributes: editedTemplate.attributes,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Edited successfully',
          duration: 2000,
        });

        await fetchProperties();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        duration: 2000,
      });
    }
  };

  const handleTemplateDelete = async (editedTemplate) => {
    try {
      const response = await deleteProperty({
        id: editedTemplate._id,
      });

      if (response) {
        toast({
          title: 'Properties Template',
          description: 'Deleted successfully',
          duration: 2000,
        });

        await fetchProperties();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        duration: 2000,
      });
    }
  };

  const handlePropertyChange = (index, field, value) => {
    const updatedProperties = editableProperties.map((prop, i) =>
      i === index ? { ...prop, [field]: value } : prop,
    );
    setEditableProperties(updatedProperties);
    updateTemplate(updatedProperties);
  };

  const handleAddProperty = () => {
    const newProperty = { type: 'New Property', value: 'Enter value' };
    setEditableProperties([...editableProperties, newProperty]);
    updateTemplate([...editableProperties, newProperty]);
  };

  const handleRemoveProperty = (index) => {
    const updatedProperties = editableProperties.filter((_, i) => i !== index);
    setEditableProperties(updatedProperties);
    updateTemplate(updatedProperties);
  };

  return (
    <div className="bg-template-gradient p-4 gap-y-2 rounded-lg flex flex-col text-white-80">
      <p className="text-lg font-semibold">Properties</p>
      <span className="text-white/[53%] font-AzeretMono text-xs">
        Textual Traits that show up as rectangle.
      </span>
      <div className="flex flex-col gap-y-3 mt-4">
        <p className="font-medium">Select Properties Template</p>
        <div className="flex flex-wrap gap-5 font-medium text-lg">
          <div
            onClick={() =>
              handleTemplateSelect({
                name: 'Basic Template',
                attributes: defaultAttributes,
                _id: 'basic',
              })
            }
            className={`w-[18rem] h-[15rem] bg-[#232323] border-2 flex justify-center items-center rounded-md relative ${advancedDetails.propertyTemplateId === 'basic'
              ? 'border-neon'
              : 'border-none'
              }`}
          >
            <p>Basic Template</p>
          </div>

          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleTemplateSelect(item)}
              className={`w-[18rem] h-[15rem] bg-[#232323] border-2 flex justify-center items-center rounded-md relative font-medium text-lg ${advancedDetails.propertyTemplateId === item._id
                ? 'border-neon'
                : 'border-none'
                }`}
            >
              <p>{item.name}</p>
              <button
                className="absolute bottom-2 right-2 text-[#DDF247] border border-white/[20%] px-[10px] rounded py-1 text-[14px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateEdit(item);
                }}
              >
                Edit
              </button>
              <div
                className="absolute top-2 right-2 cursor-pointer w-[26px] h-[26px] flex items-center justify-center rounded-full border border-white/[20%]"
                onClick={() => handleTemplateDelete(item)}
              >
                <img src="/assets/icons/trash.svg" className="w-4 h-4" />
              </div>
            </div>
          ))}

          <div
            onClick={() => setIsModalOpenTemplate(true)}
            className="w-[18rem] h-[15rem] bg-[#232323] flex flex-col gap-y-2 justify-center items-center rounded-md relative"
          >
            <div className="w-12 h-12 rounded-full bg-[#111] border border-white/[30%] flex items-center justify-center">
              <img
                src="/assets/icons/plus.svg"
                alt="plus"
                width="20"
                height="20"
              />
            </div>
            <p className="text-[#828282] font-medium text-lg">
              Add new template
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 my-5">
          {editableProperties.map((item, index) => (
            <div
              key={index}
              className="flex justify-center min-h-[93px] relative p-4 gap-y-1 flex-col w-[10rem] border border-[#ffffff12] rounded-md"
            >
              <input
                type="text"
                className="text-white text-center text-sm w-[80%] rounded-md bg-transparent mx-auto"
                value={item.type}
                onChange={(e) =>
                  handlePropertyChange(index, 'type', e.target.value)
                }
              />
              <input
                type="text"
                className="text-[#888] text-sm text-center w-[80%] rounded-md bg-transparent mx-auto"
                value={item.value}
                onChange={(e) =>
                  handlePropertyChange(index, 'value', e.target.value)
                }
              />
              <div
                className="absolute top-2 right-2 cursor-pointer w-[26px] h-[26px] flex items-center justify-center rounded-full border border-[#ffffff12]"
                onClick={() => handleRemoveProperty(index)}
              >
                <img src="/assets/icons/trash.svg" className="w-4 h-4" />
              </div>
            </div>
          ))}
          {addStatus && (
            <div
              className="flex cursor-pointer justify-center relative py-3 gap-y-1 items-center w-[10rem] border-2 border-[#DDF247] rounded-md"
              onClick={handleAddProperty}
            >
              <img src="/assets/icons/add-new.svg" className="w-10 h-10" />
              <p className="text-center text-sm text-[#DDF247]">Add New</p>
            </div>
          )}
        </div>

        <div className="flex gap-x-3 item-center">
          <img src="/assets/icons/dot.svg" className="w-4 h-4" />
          <span className="text-sm">
            You can freely change properties values by clicking on the title and
            content.
          </span>
        </div>
      </div>

      <PropertiesInfo
        close={() => setIsModalOpenTemplate(false)}
        isOpen={isModalOpenTemplate}
        onTemplateAdd={fetchProperties}
      />
    </div>
  );
}
