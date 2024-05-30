import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, SubmitHandler } from "react-hook-form";

interface FormInputs {
  receiverEmail: string;
  message: string;
  address: string;
}

function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [file, setFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (!file) {
      alert("Please upload a file");
      return;
    }

    // Handle form submission logic here
    console.log("Form Data:", data);
    console.log("Uploaded File:", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("receiverEmail", data.receiverEmail);
    formData.append("message", data.message);
    formData.append("address", data.address);

    fetch("http://localhost:3000/transfer", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>
      <div className="flex flex-row justify-center items-center">
        <article className="w-96 overflow-hidden rounded-lg shadow transition hover:shadow-lg">
          <div className="bg-white shadow p-4 sm:p-6">
            <a href="#">
              <h3 className="mt-0.5 pb-2 text-lg text-gray-900">Upload file</h3>
            </a>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-group">
                <div
                  {...getRootProps({
                    className:
                      "border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer",
                  })}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <p className="text-sm  text-gray-500">{file.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Drag 'n' drop a file here, or click to select a file
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="receiverEmail"
                  className="relative block overflow-hidden border-b border-gray-200 bg-transparent pt-3 focus-within:border-blue-600"
                >
                  <input
                    type="email"
                    id="receiverEmail"
                    placeholder="Email to"
                    className="peer h-8 text-gray-700 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                    {...register("receiverEmail", { required: true })}
                  />

                  <span className="absolute start-0 top-2 -translate-y-1/2 text-xs text-gray-900 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-xs">
                    Email to
                  </span>
                </label>
                {errors.receiverEmail && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="message"
                  className="relative block overflow-hidden border-b border-gray-200 bg-transparent pt-3 focus-within:border-blue-600"
                >
                  <input
                    id="message"
                    placeholder="Message"
                    className="peer h-8 text-gray-700 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                    {...register("message", { required: true })}
                  />

                  <span className="absolute start-0 top-2 -translate-y-1/2 text-xs text-gray-900 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-xs">
                    Message
                  </span>
                </label>
                {errors.message && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="address"
                  className="relative block overflow-hidden border-b border-gray-200 bg-transparent pt-3 focus-within:border-blue-600"
                >
                  <input
                    id="address"
                    placeholder="EVM Address"
                    className="peer h-8 text-gray-700 w-full border-none bg-transparent p-0 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                    {...register("address", { required: true })}
                  />

                  <span className="absolute start-0 top-2 -translate-y-1/2 text-xs text-gray-900 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-lg peer-focus:top-2 peer-focus:text-xs">
                    EVM Address
                  </span>
                </label>
                {errors.message && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send
              </button>
            </form>
          </div>
        </article>
      </div>
    </>
  );
}

export default Home;
